import { NextRequest, NextResponse } from 'next/server'
import { getRedisInstance, shortUrlExists } from '@/lib/redis'
import { generateShortUrlWithCustom, checkBannedWords } from '@/lib/utils'
import { getUserFromRequest, hashPassword } from '@/lib/auth'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, password, customShortUrl, captchaToken } = body

    if (!title?.trim()) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      )
    }

    if (!captchaToken) {
      return NextResponse.json(
        { error: '请完成验证码验证' },
        { status: 400 }
      )
    }

    // 验证验证码格式（只接受图形验证码）
    if (!captchaToken.startsWith('image-captcha-')) {
      return NextResponse.json(
        { error: '验证码格式无效' },
        { status: 400 }
      )
    }

    // 验证自定义短链接
    if (customShortUrl) {
      if (!/^[a-zA-Z0-9_-]+$/.test(customShortUrl)) {
        return NextResponse.json(
          { error: '短链接只能包含字母、数字、下划线和连字符' },
          { status: 400 }
        )
      }
      if (customShortUrl.length < 3 || customShortUrl.length > 50) {
        return NextResponse.json(
          { error: '短链接长度应在3-50个字符之间' },
          { status: 400 }
        )
      }
      
      // 检查短链接是否已存在
      const exists = await shortUrlExists(customShortUrl)
      if (exists) {
        return NextResponse.json(
          { error: '该短链接已被使用，请选择其他后缀' },
          { status: 409 }
        )
      }
    }

    const redis = getRedisInstance()
    const user = getUserFromRequest(request)
    
    // 获取用户的免审核权限状态
    let noContentAudit = false
    if (user) {
      const userDataRaw = await redis.get(`user:${user.userId}`)
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
    }

    console.log(`用户 ${user?.userId} 的免审核状态:`, noContentAudit)

    // 违禁词检测 - 只检测内容，不检测标题（免审核用户跳过）
    if (content?.trim() && !noContentAudit) {
      const contentResult = await checkBannedWords(content)
      
      if (!contentResult.isValid) {
        return NextResponse.json({
          error: '内容包含违禁词汇',
          bannedWords: contentResult.bannedWords
        }, { status: 400 })
      }
    } else if (noContentAudit) {
      console.log('用户已开启免审核，跳过内容检测')
    }
    
    const noteId = nanoid()
    const now = new Date().toISOString()
    
    const note = {
      id: noteId,
      title: title.trim(),
      content: content.trim(),
      createdAt: now,
      updatedAt: now,
      userId: user?.userId || null,
      passwordHash: password ? hashPassword(password) : null,
      shortUrl: generateShortUrlWithCustom(customShortUrl)
    }

    // 保存笔记
    await redis.set(`note:${noteId}`, JSON.stringify(note))
    
    // 添加到索引
    await redis.sadd('notes:index', noteId)
    
    // 如果有短链接，建立映射
    if (note.shortUrl) {
      await redis.set(`short:${note.shortUrl}`, noteId)
    }
    
    // 如果用户已登录，添加到用户的笔记列表
    if (user?.userId) {
      await redis.sadd(`user:${user.userId}:notes`, noteId)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: note.id,
        title: note.title,
        shortUrl: note.shortUrl
      }
    })

  } catch (error) {
    console.error('Create note error:', error)
    return NextResponse.json(
      { error: '创建笔记失败' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const redis = getRedisInstance()
    const user = getUserFromRequest(request)
    
    // 必须登录才能获取笔记列表
    if (!user?.userId) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }
    
    // 获取当前用户的笔记ID
    const noteIds = await redis.smembers(`user:${user.userId}:notes`)
    
    if (!noteIds || noteIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // 获取用户笔记详情
    const notes = []
    for (const noteId of noteIds) {
      const noteData = await redis.get(`note:${noteId}`)
      if (noteData) {
        const note = typeof noteData === 'string' ? JSON.parse(noteData) : noteData
        // 双重检查：确保笔记确实属于当前用户
        if (note.userId === user.userId) {
          notes.push({
            id: note.id,
            title: note.title,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
            isPasswordProtected: !!(note.passwordHash || (note as any).password),
            shortUrl: note.shortUrl
          })
        }
      }
    }

    // 按创建时间降序排序
    notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      success: true,
      data: notes
    })

  } catch (error) {
    console.error('Get notes error:', error)
    return NextResponse.json(
      { error: '获取笔记列表失败' },
      { status: 500 }
    )
  }
}