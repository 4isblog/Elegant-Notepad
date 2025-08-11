import { NextRequest, NextResponse } from 'next/server'
import { getRedisInstance } from '@/lib/redis'
import { comparePassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, captchaToken } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名/邮箱和密码不能为空' },
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

    const redis = getRedisInstance()

    // 判断输入的是邮箱还是用户名
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)
    let userId
    
    if (isEmail) {
      // 通过邮箱查找用户ID
      userId = await redis.get(`user:email:${username}`)
    } else {
      // 通过用户名查找用户ID
      userId = await redis.get(`user:username:${username}`)
    }
    
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: '用户名/邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 获取用户信息
    const userData = await redis.get(`user:${userId}`)
    if (!userData) {
      return NextResponse.json(
        { error: '用户名/邮箱或密码错误' },
        { status: 401 }
      )
    }

    const user = typeof userData === 'string' ? JSON.parse(userData) : userData

    // 验证密码
    if (!comparePassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: '用户名/邮箱或密码错误' },
        { status: 401 }
      )
    }

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
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        noContentAudit: user.noContentAudit || false
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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    )
  }
} 