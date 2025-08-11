import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { getRedisInstance } from '@/lib/redis'
import { sendEmail, sendEmailDev } from '@/lib/email'

// 简单的邮件验证正则
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 生成美化的邮件模板
function generateEmailTemplate(verificationCode: string, actionText: string, greetingText: string, email: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${greetingText}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin-top: 40px;
            margin-bottom: 40px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 32px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .header p {
            margin: 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 32px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 24px;
        }
        .verification-box {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 32px;
            text-align: center;
            margin: 32px 0;
        }
        .verification-label {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }
        .verification-code {
            font-size: 36px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: 8px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            background: #ffffff;
            padding: 16px 24px;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            display: inline-block;
            margin: 8px 0;
        }
        .expire-notice {
            color: #ef4444;
            font-size: 14px;
            font-weight: 600;
            margin-top: 16px;
        }
        .instructions {
            background-color: #f1f5f9;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 24px 0;
            border-radius: 0 8px 8px 0;
        }
        .instructions p {
            margin: 0;
            color: #475569;
        }
        .security-notice {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }
        .security-notice h3 {
            color: #dc2626;
            margin: 0 0 12px 0;
            font-size: 16px;
            font-weight: 600;
        }
        .security-notice p {
            margin: 0;
            color: #7f1d1d;
            font-size: 14px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
        }
        .footer .brand {
            font-weight: 600;
            color: #3b82f6;
            margin-bottom: 8px;
        }
        .footer .contact {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
        }
        .footer .contact a {
            color: #3b82f6;
            text-decoration: none;
        }
        .footer .contact a:hover {
            text-decoration: underline;
        }
        @media (max-width: 640px) {
            .container {
                margin: 20px 16px;
            }
            .header, .content, .footer {
                padding: 24px 20px;
            }
            .verification-code {
                font-size: 28px;
                letter-spacing: 4px;
                padding: 12px 16px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📝 优雅记事本</h1>
            <p>简洁、安全、高效的在线笔记平台</p>
        </div>
        
        <div class="content">
            <div class="greeting">${greetingText}</div>
            
            <p>您好！感谢您使用优雅记事本。</p>
            <p>您正在进行${actionText}操作，请使用以下验证码完成验证：</p>
            
            <div class="verification-box">
                <div class="verification-label">验证码</div>
                <div class="verification-code">${verificationCode}</div>
                <div class="expire-notice">⏰ 有效期：5分钟</div>
            </div>
            
            <div class="instructions">
                <p><strong>📋 使用说明：</strong></p>
                <p>• 请在5分钟内输入此验证码</p>
                <p>• 验证码仅限本次${actionText}使用</p>
                <p>• 请勿将验证码泄露给他人</p>
            </div>
            
            <div class="security-notice">
                <h3>🔒 安全提醒</h3>
                <p>如果这不是您本人的操作，请忽略此邮件。我们建议您立即修改密码并检查账户安全。</p>
            </div>
        </div>
        
        <div class="footer">
            <p class="brand">优雅记事本团队</p>
            <p>致力于为您提供最优质的笔记服务</p>
            <div class="contact">
                <p>技术支持：<a href="mailto:service@4is.cc">service@4is.cc</a></p>
                <p>© 2025 优雅记事本. 保留所有权利.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim()
}

// 使用真实邮件发送（开发和生产环境都用真实邮件）
async function sendVerificationEmail(to: string, subject: string, content: string): Promise<boolean> {
  // 如果没有配置邮件服务，则使用开发模拟
  const hasEmailConfig = process.env.EMAIL_PROVIDER && 
    (process.env.SMTP_USER || process.env.SENDGRID_API_KEY || process.env.AWS_ACCESS_KEY_ID)
  
  if (hasEmailConfig) {
    try {
      await sendEmail(to, subject, content)
      return true
    } catch (error) {
      console.error('真实邮件发送失败:', error)
      throw error // 抛出错误让API返回错误信息
    }
  } else {
    console.warn('⚠️  邮件服务未配置，使用模拟发送。请查看 MAIL_SETUP.md 配置邮件服务。')
    return await sendEmailDev(to, subject, content)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json()
    const redis = getRedisInstance()

    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    if (!type || !['register', 'reset'].includes(type)) {
      return NextResponse.json(
        { success: false, error: '无效的验证码类型' },
        { status: 400 }
      )
    }

    // 检查发送频率限制（同一邮箱60秒内只能发送一次）
    const rateLimitKey = `email_rate_limit:${email}`
    const lastSent = await redis.get(rateLimitKey)
    
    if (lastSent) {
      return NextResponse.json(
        { success: false, error: '请稍后再试，60秒内只能发送一次验证码' },
        { status: 429 }
      )
    }

    // 生成6位数字验证码
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 存储验证码到Redis（5分钟过期）- 确保存储为字符串
    const verificationKey = `verification:${type}:${email}`
    await redis.setex(verificationKey, 300, String(verificationCode)) // 5分钟过期，确保为字符串
    
    // 设置发送频率限制（60秒）
    await redis.setex(rateLimitKey, 60, Date.now().toString())

    // 发送邮件
    const subject = type === 'register' ? '🎉 优雅记事本 - 注册验证码' : '🔐 优雅记事本 - 密码重置验证码'
    const actionText = type === 'register' ? '注册账号' : '重置密码'
    const greetingText = type === 'register' ? '欢迎加入优雅记事本！' : '密码重置验证'
    
    const content = generateEmailTemplate(verificationCode, actionText, greetingText, email)

    const emailSent = await sendVerificationEmail(email, subject, content)
    
    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: '邮件发送失败，请稍后重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送到您的邮箱，请查收'
    })

  } catch (error) {
    console.error('发送验证码失败:', error)
    return NextResponse.json(
      { success: false, error: '发送验证码失败，请稍后重试' },
      { status: 500 }
    )
  }
} 