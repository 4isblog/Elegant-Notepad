import { NextRequest, NextResponse } from 'next/server'
import { getRedisInstance } from '@/lib/redis'
import { comparePassword } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { password, captchaToken } = body

    if (!password) {
      return NextResponse.json(
        { error: '密码不能为空' },
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
    const noteData = await redis.get(`note:${params.id}`)

    if (!noteData) {
      return NextResponse.json(
        { error: '笔记不存在' },
        { status: 404 }
      )
    }

    const note = typeof noteData === 'string' ? JSON.parse(noteData) : noteData

    const notePassword = note.passwordHash || (note as any).password
    if (!notePassword) {
      return NextResponse.json(
        { error: '此笔记没有设置密码' },
        { status: 400 }
      )
    }

    // 验证密码 - 如果是旧格式的明文密码，直接比较；如果是哈希密码，使用comparePassword
    let isValidPassword = false
    if (note.passwordHash) {
      // 新格式：哈希密码
      isValidPassword = comparePassword(password, note.passwordHash)
    } else if ((note as any).password) {
      // 旧格式：明文密码
      isValidPassword = password === (note as any).password
    }
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '密码验证成功'
    })

  } catch (error) {
    console.error('Password verification error:', error)
    return NextResponse.json(
      { error: '验证失败' },
      { status: 500 }
    )
  }
}