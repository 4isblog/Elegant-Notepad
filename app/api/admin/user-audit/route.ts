import { NextRequest, NextResponse } from 'next/server'
import { getRedisInstance } from '@/lib/redis'
import { getUserFromRequest } from '@/lib/auth'
import jwt from 'jsonwebtoken'

// JWT_SECRET从auth.ts中获取
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'

// 管理员用户ID列表 - 可以通过环境变量配置
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').filter(id => id.trim())

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, noContentAudit } = body
    const redis = getRedisInstance()

    // 检查当前用户是否为管理员 - 使用cookie认证
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch (error) {
      return NextResponse.json(
        { error: '无效的认证token' },
        { status: 401 }
      )
    }
    
    if (!ADMIN_USER_IDS.includes(decoded.userId)) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    // 获取目标用户
    const userDataRaw = await redis.get(`user:${userId}`)
    if (!userDataRaw) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 处理不同的数据类型
    let userData
    if (typeof userDataRaw === 'object') {
      userData = userDataRaw
    } else if (typeof userDataRaw === 'string') {
      try {
        userData = JSON.parse(userDataRaw)
      } catch (parseError) {
        return NextResponse.json(
          { error: '用户数据格式错误' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: '用户数据类型错误' },
        { status: 500 }
      )
    }
    
    // 更新用户的免审核权限
    userData.noContentAudit = noContentAudit === true
    userData.updatedAt = new Date().toISOString()

    // 保存更新后的用户信息
    await redis.set(`user:${userId}`, JSON.stringify(userData))

    return NextResponse.json({
      success: true,
      message: '用户权限更新成功'
    })

  } catch (error) {
    console.error('更新用户审核权限失败:', error)
    return NextResponse.json(
      { error: '更新用户审核权限失败' },
      { status: 500 }
    )
  }
}

// 获取用户审核权限状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    
    if (!query) {
      return NextResponse.json(
        { error: '请提供用户ID或用户名' },
        { status: 400 }
      )
    }

    // 检查当前用户是否为管理员 - 使用cookie认证
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch (error) {
      return NextResponse.json(
        { error: '无效的认证token' },
        { status: 401 }
      )
    }
    
    if (!ADMIN_USER_IDS.includes(decoded.userId)) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const redis = getRedisInstance()
    let userData = null
    let userDataRaw = null

    // 首先尝试作为用户ID搜索
    userDataRaw = await redis.get(`user:${query}`)

    if (!userDataRaw) {
      // 如果用户ID搜索失败，尝试作为用户名搜索
      const userIdFromUsername = await redis.get(`user:username:${query}`)

      if (userIdFromUsername) {
        userDataRaw = await redis.get(`user:${userIdFromUsername}`)
      }
    }

    if (!userDataRaw) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 处理不同的数据类型
    if (typeof userDataRaw === 'object') {
      // 如果Redis返回的已经是对象，直接使用
      userData = userDataRaw
    } else if (typeof userDataRaw === 'string') {
      // 如果是字符串，尝试JSON解析
      try {
        userData = JSON.parse(userDataRaw)
      } catch (parseError) {
        console.error('JSON解析失败:', parseError)
        return NextResponse.json(
          { error: '用户数据格式错误' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: '用户数据类型错误' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: userData.id,
        username: userData.username,
        email: userData.email,
        noContentAudit: userData.noContentAudit || false
      }
    })

  } catch (error) {
    console.error('获取用户审核权限失败:', error)
    return NextResponse.json(
      { error: '获取用户审核权限失败' },
      { status: 500 }
    )
  }
} 