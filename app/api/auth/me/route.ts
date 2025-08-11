import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getRedisInstance } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json({
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

  } catch (error) {
    console.error('Get user info error:', error)
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    )
  }
} 