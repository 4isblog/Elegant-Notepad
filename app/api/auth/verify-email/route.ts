import { NextRequest, NextResponse } from 'next/server'
import { getRedisInstance } from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const { email, code, type } = await request.json()
    const redis = getRedisInstance()

    if (!email || !code || !type) {
      return NextResponse.json(
        { success: false, error: '请提供完整的验证信息' },
        { status: 400 }
      )
    }

    if (!['register', 'reset'].includes(type)) {
      return NextResponse.json(
        { success: false, error: '无效的验证码类型' },
        { status: 400 }
      )
    }

    // 获取存储的验证码
    const verificationKey = `verification:${type}:${email}`
    const storedCode = await redis.get(verificationKey)

    if (!storedCode) {
      return NextResponse.json(
        { success: false, error: '验证码已过期或不存在，请重新发送' },
        { status: 400 }
      )
    }

    // 去除可能的空格并转换为字符串进行比较
    const cleanUserCode = String(code).trim()
    const cleanStoredCode = String(storedCode).trim()

    if (cleanStoredCode !== cleanUserCode) {
      return NextResponse.json(
        { success: false, error: '验证码错误' },
        { status: 400 }
      )
    }

    // 验证成功，删除验证码
    await redis.del(verificationKey)

    // 为该邮箱生成一个临时令牌，用于后续的注册或密码重置操作
    const tempToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const tempTokenKey = `temp_token:${type}:${email}`
    await redis.setex(tempTokenKey, 600, tempToken) // 10分钟有效

    return NextResponse.json({
      success: true,
      message: '邮箱验证成功',
      tempToken
    })

  } catch (error) {
    console.error('验证邮箱失败:', error)
    return NextResponse.json(
      { success: false, error: '验证失败，请稍后重试' },
      { status: 500 }
    )
  }
} 