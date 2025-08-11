import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, comparePassword } from '@/lib/auth'
import { getRedisInstance } from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const { password, confirmText } = await request.json()

    if (!password || !confirmText) {
      return NextResponse.json(
        { error: '请提供密码和确认文本' },
        { status: 400 }
      )
    }

    if (confirmText !== '删除我的账号') {
      return NextResponse.json(
        { error: '确认文本不正确' },
        { status: 400 }
      )
    }

    // 从 cookie 中获取 token
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    // 验证 token
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Token 无效' },
        { status: 401 }
      )
    }

    const redis = getRedisInstance()
    
    // 获取用户信息
    const userData = await redis.get(`user:${payload.userId}`)
    if (!userData) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      )
    }

    const user = typeof userData === 'string' ? JSON.parse(userData) : userData

    // 验证密码
    if (!comparePassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      )
    }

    // 删除用户相关的所有数据
    const userId = user.id
    const username = user.username
    const email = user.email

    // 获取用户的所有笔记
    const userNotesKey = `user:${userId}:notes`
    const noteIds = await redis.smembers(userNotesKey)

    // 删除所有笔记和相关数据
    const deletePromises = []
    
    for (const noteId of noteIds) {
      // 删除笔记本身
      deletePromises.push(redis.del(`note:${noteId}`))
      
      // 删除笔记的短链接映射
      const noteData = await redis.get(`note:${noteId}`)
      if (noteData) {
        const note = typeof noteData === 'string' ? JSON.parse(noteData) : noteData
        if (note.shortUrl) {
          deletePromises.push(redis.del(`short:${note.shortUrl}`))
        }
      }
    }

    // 删除用户笔记集合
    deletePromises.push(redis.del(userNotesKey))

    // 删除用户数据
    deletePromises.push(redis.del(`user:${userId}`))
    deletePromises.push(redis.del(`user:username:${username}`))
    deletePromises.push(redis.del(`user:email:${email}`))

    // 执行所有删除操作
    await Promise.all(deletePromises)

    // 清除cookie
    const response = NextResponse.json({
      success: true,
      message: '账号已成功注销'
    })

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    })

    return response

  } catch (error) {
    console.error('Account deactivation error:', error)
    return NextResponse.json(
      { error: '注销失败，请稍后重试' },
      { status: 500 }
    )
  }
} 