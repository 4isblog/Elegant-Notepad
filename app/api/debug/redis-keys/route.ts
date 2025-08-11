import { NextRequest, NextResponse } from 'next/server'
import { getRedisInstance } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    const redis = getRedisInstance()
    
    // 获取所有用户相关的键
    const userKeys = await redis.keys('user:*')
    const usernameKeys = await redis.keys('user:username:*')
    
    // 获取一些示例数据
    const keyData: Record<string, any> = {}
    
    // 获取前10个用户键的数据
    for (const key of userKeys.slice(0, 10)) {
      try {
        const data = await redis.get(key)
        if (data) {
          const parsed = JSON.parse(data as string)
          keyData[key] = {
            id: parsed.id,
            username: parsed.username,
            email: parsed.email
          }
        }
      } catch (e) {
        keyData[key] = 'JSON解析错误'
      }
    }
    
    // 获取用户名映射
    const usernameMapping: Record<string, any> = {}
    for (const key of usernameKeys) {
      try {
        const userId = await redis.get(key)
        usernameMapping[key] = userId
      } catch (e) {
        usernameMapping[key] = '获取失败'
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUserKeys: userKeys.length,
        totalUsernameKeys: usernameKeys.length,
        sampleUserData: keyData,
        usernameMapping: usernameMapping,
        allUserKeys: userKeys.slice(0, 20), // 只显示前20个键
        allUsernameKeys: usernameKeys
      }
    })

  } catch (error) {
    console.error('调试Redis失败:', error)
    return NextResponse.json(
      { error: '调试Redis失败' },
      { status: 500 }
    )
  }
} 