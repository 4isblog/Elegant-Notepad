import { NextRequest, NextResponse } from 'next/server'
import { getNote, saveNote, deleteNote, getRedisInstance } from '@/lib/redis'
import { getUserFromRequest } from '@/lib/auth'
import { sanitizeTitle, sanitizeContent, hashPassword, validateContentFilter } from '@/lib/utils'
import { Note, UpdateNoteRequest, ApiResponse } from '@/types'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Note>>> {
  try {
    const noteId = params.id
    
    if (!noteId) {
      return NextResponse.json(
        { success: false, error: '笔记 ID 是必需的' },
        { status: 400 }
      )
    }

    const note = await getNote(noteId)
    
    if (!note) {
      return NextResponse.json(
        { success: false, error: '笔记未找到' },
        { status: 404 }
      )
    }

    // 检查用户权限
    const userPayload = await getUserFromRequest(request)
    
    // 如果笔记有所有者，检查访问权限
    if (note.userId) {
      // 如果是笔记所有者，允许完全访问
      if (userPayload && userPayload.userId === note.userId) {
        // Don't return password hash
        const responseNote = { ...note }
        const hasPassword = !!(note.passwordHash || (note as any).password)
        delete responseNote.passwordHash
        responseNote.isPasswordProtected = hasPassword

        return NextResponse.json({
          success: true,
          data: responseNote,
          isOwner: true  // 标记为所有者
        })
      }
      
      // 如果不是所有者，检查是否允许匿名访问
      // 对于分享链接，允许访问但可能需要密码验证
      const responseNote = { ...note }
              const hasPassword = !!(note.passwordHash || (note as any).password)
      delete responseNote.passwordHash
      responseNote.isPasswordProtected = hasPassword

      return NextResponse.json({
        success: true,
        data: responseNote,
        isOwner: false  // 标记为非所有者（分享链接访问）
      })
    }

    // 如果笔记没有所有者（旧数据），允许访问
    const responseNote = { ...note }
    delete responseNote.passwordHash

    return NextResponse.json({
      success: true,
      data: responseNote,
      isOwner: false
    })

  } catch (error) {
    console.error('获取笔记出错:', error)
    return NextResponse.json(
      { success: false, error: '获取笔记失败，请重试' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Note>>> {
  try {
    // 验证用户认证
    const userPayload = getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: '需要登录才能修改笔记' },
        { status: 401 }
      )
    }

    const noteId = params.id
    const body = await request.json() as UpdateNoteRequest
    
    if (!noteId) {
      return NextResponse.json(
        { success: false, error: '笔记 ID 是必需的' },
        { status: 400 }
      )
    }

    const existingNote = await getNote(noteId)
    
    if (!existingNote) {
      return NextResponse.json(
        { success: false, error: '笔记未找到' },
        { status: 404 }
      )
    }

    // 检查用户权限
    if (existingNote.userId !== userPayload.userId) {
      return NextResponse.json(
        { success: false, error: '没有权限修改此笔记' },
        { status: 403 }
      )
    }

    // 准备更新的标题和内容
    const newTitle = body.title ? body.title : existingNote.title
    const newContent = body.content !== undefined ? body.content : existingNote.content

    // 获取用户的免审核权限状态
    const redis = getRedisInstance()
    let noContentAudit = false
    const userDataRaw = await redis.get(`user:${userPayload.userId}`)
    if (userDataRaw) {
      let userData
      if (typeof userDataRaw === 'object') {
        // 如果Redis返回的已经是对象，直接使用
        userData = userDataRaw
      } else if (typeof userDataRaw === 'string') {
        // 如果是字符串，尝试JSON解析
        try {
          userData = JSON.parse(userDataRaw)
        } catch (parseError) {
          console.error('解析用户数据失败:', parseError)
          userData = null
        }
      }
      
      if (userData) {
        noContentAudit = userData.noContentAudit || false
      }
    }

    console.log(`用户 ${userPayload.userId} 的免审核状态:`, noContentAudit)

    // 违禁词检测 - 只检测内容，不检测标题（免审核用户跳过）
    if (!noContentAudit) {
      const contentFilterResult = await validateContentFilter('', newContent)
      if (!contentFilterResult.isValid) {
        return NextResponse.json(
          { 
            success: false, 
            error: contentFilterResult.error,
            bannedWords: contentFilterResult.bannedWords
          },
          { status: 400 }
        )
      }
    } else {
      console.log('用户已开启免审核，跳过内容检测')
    }

    // Update note
    const updatedNote: Note = {
      ...existingNote,
      title: sanitizeTitle(newTitle),
      content: sanitizeContent(newContent),
      updatedAt: new Date().toISOString(),
    }

    // Handle password changes
    if (body.password !== undefined) {
      if (body.password.trim()) {
        updatedNote.isPasswordProtected = true
        updatedNote.passwordHash = await hashPassword(body.password)
      } else {
        updatedNote.isPasswordProtected = false
        delete updatedNote.passwordHash
      }
    }

    await saveNote(updatedNote)

    // Don't return password hash
    const responseNote = { ...updatedNote }
    delete responseNote.passwordHash

    return NextResponse.json({
      success: true,
      data: responseNote
    })

  } catch (error) {
    console.error('更新笔记出错:', error)
    return NextResponse.json(
      { success: false, error: '更新笔记失败，请重试' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    // 验证用户认证
    const userPayload = getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: '需要登录才能删除笔记' },
        { status: 401 }
      )
    }

    const noteId = params.id
    
    if (!noteId) {
      return NextResponse.json(
        { success: false, error: '笔记 ID 是必需的' },
        { status: 400 }
      )
    }

    const existingNote = await getNote(noteId)
    
    if (!existingNote) {
      return NextResponse.json(
        { success: false, error: '笔记未找到' },
        { status: 404 }
      )
    }

    // 检查用户权限
    if (existingNote.userId !== userPayload.userId) {
      return NextResponse.json(
        { success: false, error: '没有权限删除此笔记' },
        { status: 403 }
      )
    }

    await deleteNote(noteId)

    // Remove from user's notes index
    const redis = getRedisInstance()
    await redis.srem(`user:${userPayload.userId}:notes`, noteId)

    return NextResponse.json({
      success: true,
      data: null
    })

  } catch (error) {
    console.error('删除笔记出错:', error)
    return NextResponse.json(
      { success: false, error: '删除笔记失败，请重试' },
      { status: 500 }
    )
  }
}