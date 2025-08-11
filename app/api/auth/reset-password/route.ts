import { NextRequest, NextResponse } from 'next/server'
import { getRedisInstance } from '@/lib/redis'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword, tempToken } = await request.json()
    const redis = getRedisInstance()

    if (!email || !newPassword || !tempToken) {
      return NextResponse.json(
        { success: false, error: '请提供完整的重置信息' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度至少为6位' },
        { status: 400 }
      )
    }

    // 验证临时令牌
    const tempTokenKey = `temp_token:reset:${email}`
    const storedTempToken = await redis.get(tempTokenKey)

    if (!storedTempToken || storedTempToken !== tempToken) {
      return NextResponse.json(
        { success: false, error: '验证令牌无效或已过期，请重新验证邮箱' },
        { status: 400 }
      )
    }

    // 通过邮箱查找用户ID
    const emailKey = `user:email:${email}`
    const userId = await redis.get(emailKey)

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取用户数据
    const userKey = `user:${userId}`
    const userData = await redis.get(userKey)

    if (!userData) {
      return NextResponse.json(
        { success: false, error: '用户数据不存在' },
        { status: 404 }
      )
    }

    // 更新密码 - 使用与注册时相同的哈希方法
    let user
    try {
      // userData可能已经是对象，也可能是字符串
      if (typeof userData === 'string') {
        user = JSON.parse(userData)
      } else {
        user = userData
      }
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: '用户数据格式错误' },
        { status: 500 }
      )
    }
    
    // 使用与注册相同的密码哈希方法
    const passwordHash = hashPassword(newPassword)
    
    user.passwordHash = passwordHash  // 注意：使用 passwordHash 字段，与注册时保持一致
    user.updatedAt = new Date().toISOString()

    await redis.set(userKey, JSON.stringify(user))

    // 删除临时令牌
    await redis.del(tempTokenKey)

    return NextResponse.json({
      success: true,
      message: '密码重置成功，请使用新密码登录'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: '重置密码失败，请稍后重试' },
      { status: 500 }
    )
  }
} 