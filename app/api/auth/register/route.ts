import { NextRequest, NextResponse } from 'next/server'
import { getRedisInstance } from '@/lib/redis'
import { hashPassword, generateToken } from '@/lib/auth'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, email, emailCode, captchaToken } = body
    const redis = getRedisInstance()

    if (!username || !password || !email || !emailCode) {
      return NextResponse.json(
        { error: '请填写完整的注册信息' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
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

    // 验证邮箱验证码
    const tempTokenKey = `temp_token:register:${email}`
    const storedTempToken = await redis.get(tempTokenKey)

    if (!storedTempToken) {
      return NextResponse.json(
        { error: '邮箱验证已过期，请重新验证' },
        { status: 400 }
      )
    }

    // 验证用户名格式
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: '用户名长度应在3-20个字符之间' },
        { status: 400 }
      )
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        { error: '用户名只能包含字母、数字、下划线和连字符' },
        { status: 400 }
      )
    }

    // 验证密码格式
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6个字符' },
        { status: 400 }
      )
    }

    // 检查用户名是否已存在
    const existingUserId = await redis.get(`user:username:${username}`)
    if (existingUserId) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 409 }
      )
    }

    // 检查邮箱是否已存在
    const existingEmailUserId = await redis.get(`user:email:${email}`)
    if (existingEmailUserId) {
      return NextResponse.json(
        { error: '邮箱已存在' },
        { status: 409 }
      )
    }

    // 创建用户
    const userId = nanoid()
    const hashedPassword = hashPassword(password)
    
    const user = {
      id: userId,
      username,
      email,
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      noContentAudit: false  // 默认需要审核
    }

    // 保存用户信息
    await redis.set(`user:${userId}`, JSON.stringify(user))
    await redis.set(`user:username:${username}`, userId)
    await redis.set(`user:email:${email}`, userId)

    // 删除邮箱验证的临时令牌
    await redis.del(tempTokenKey)

    // 生成 JWT token
    const token = generateToken({ 
      userId: user.id, 
      username: user.username 
    })

    // 设置 cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '注册失败' },
      { status: 500 }
    )
  }
} 