import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // 获取当前用户
    let currentUser = null
    try {
      currentUser = getUserFromRequest(request)
    } catch (userError) {
      // 用户认证失败，继续执行
    }
    
    // 获取环境变量配置
    const adminUserIds = process.env.ADMIN_USER_IDS || ''
    const adminIdsArray = adminUserIds.split(',').filter(id => id.trim())
    
    const isCurrentUserAdmin = currentUser ? adminIdsArray.includes(currentUser.userId) : false
    
    return NextResponse.json({
      success: true,
      data: {
        currentUser: currentUser ? {
          userId: currentUser.userId,
          username: currentUser.username
        } : null,
        adminUserIds: adminUserIds,
        adminIdsArray: adminIdsArray,
        isCurrentUserAdmin: isCurrentUserAdmin,
        envVariableExists: !!process.env.ADMIN_USER_IDS
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: '获取管理员配置失败',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 