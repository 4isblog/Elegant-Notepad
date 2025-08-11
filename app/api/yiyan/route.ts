import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 获取API密钥
    const apiKey = process.env.YIYAN_API_KEY
    
    if (!apiKey) {
      console.warn('未设置一言API密钥，返回默认励志语')
      return NextResponse.json({
        code: 200,
        msg: '保持积极的心态，每一天都是新的开始。'
      })
    }

    // 调用一言API
    const response = await fetch(`https://cn.apihz.cn/api/yiyan/api.php?id=10003018&key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.warn(`一言API调用失败 (状态码: ${response.status})`)
      return NextResponse.json({
        code: 200,
        msg: '生活需要一点智慧，学习需要一点耐心。'
      })
    }

    const result = await response.json()
    
    // 检查API调用是否成功
    if (result.code !== 200) {
      console.warn('一言API返回错误:', result.msg || '未知错误')
      return NextResponse.json({
        code: 200,
        msg: '每个优秀的人，都有一段沉默的时光。'
      })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('一言API异常:', error)
    return NextResponse.json({
      code: 200,
      msg: '山路不怕弯弯曲曲，只要朝着目标前进。'
    })
  }
} 