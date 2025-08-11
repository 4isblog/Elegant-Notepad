// 邮件服务配置
// 支持多种邮件服务提供商：SMTP、SendGrid、AWS SES等

interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'aws-ses'
  from: string
  fromName: string
}

interface SMTPConfig extends EmailConfig {
  provider: 'smtp'
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface SendGridConfig extends EmailConfig {
  provider: 'sendgrid'
  apiKey: string
}

interface AWSConfig extends EmailConfig {
  provider: 'aws-ses'
  region: string
  accessKeyId: string
  secretAccessKey: string
}

type MailConfig = SMTPConfig | SendGridConfig | AWSConfig

// 从环境变量获取邮件配置
function getEmailConfig(): MailConfig {
  const provider = process.env.EMAIL_PROVIDER as 'smtp' | 'sendgrid' | 'aws-ses' || 'smtp'
  const from = process.env.EMAIL_FROM || 'noreply@example.com'
  const fromName = process.env.EMAIL_FROM_NAME || '优雅记事本'

  switch (provider) {
    case 'sendgrid':
      return {
        provider: 'sendgrid',
        from,
        fromName,
        apiKey: process.env.SENDGRID_API_KEY || ''
      }
    
    case 'aws-ses':
      return {
        provider: 'aws-ses',
        from,
        fromName,
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    
    case 'smtp':
    default:
      return {
        provider: 'smtp',
        from,
        fromName,
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      }
  }
}

// 发送邮件的通用接口
export async function sendEmail(to: string, subject: string, content: string): Promise<boolean> {
  const config = getEmailConfig()
  
  try {
    switch (config.provider) {
      case 'smtp':
        return await sendEmailWithSMTP(config, to, subject, content)
      
      case 'sendgrid':
        return await sendEmailWithSendGrid(config, to, subject, content)
      
      case 'aws-ses':
        return await sendEmailWithAWS(config, to, subject, content)
      
      default:
        throw new Error(`不支持的邮件服务提供商: ${(config as any).provider}`)
    }
  } catch (error) {
    console.error('发送邮件失败:', error)
    throw error // 重新抛出错误，让上层处理
  }
}

// SMTP 发送邮件
async function sendEmailWithSMTP(config: SMTPConfig, to: string, subject: string, content: string): Promise<boolean> {
  // 这里需要安装 nodemailer: npm install nodemailer @types/nodemailer
  try {
    // 检查 nodemailer 是否安装
    let nodemailer
    try {
      nodemailer = require('nodemailer')
    } catch (requireError) {
      throw new Error('nodemailer 未安装，请运行: npm install nodemailer @types/nodemailer')
    }
    
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth
    })

    // 检测内容是否为HTML
    const isHTML = content.trim().startsWith('<!DOCTYPE html') || content.trim().startsWith('<html')
    
    const mailOptions = {
      from: `${config.fromName} <${config.from}>`,
      to: to,
      subject: subject,
      text: isHTML ? undefined : content, // 如果是HTML，不设置纯文本
      html: isHTML ? content : content.replace(/\n/g, '<br>')
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('SMTP 邮件发送成功:', result.messageId)
    return true
  } catch (error) {
    console.error('SMTP 发送失败:', error)
    throw error // 重新抛出错误，而不是返回false
  }
}

// SendGrid 发送邮件
async function sendEmailWithSendGrid(config: SendGridConfig, to: string, subject: string, content: string): Promise<boolean> {
  // 这里需要安装 @sendgrid/mail: npm install @sendgrid/mail
  try {
    let sgMail
    try {
      sgMail = require('@sendgrid/mail')
    } catch (requireError) {
      throw new Error('@sendgrid/mail 未安装，请运行: npm install @sendgrid/mail')
    }
    
    sgMail.setApiKey(config.apiKey)

    // 检测内容是否为HTML
    const isHTML = content.trim().startsWith('<!DOCTYPE html') || content.trim().startsWith('<html')

    const msg = {
      to: to,
      from: {
        email: config.from,
        name: config.fromName
      },
      subject: subject,
      text: isHTML ? undefined : content, // 如果是HTML，不设置纯文本
      html: isHTML ? content : content.replace(/\n/g, '<br>')
    }

    await sgMail.send(msg)
    console.log('SendGrid 邮件发送成功')
    return true
  } catch (error) {
    console.error('SendGrid 发送失败:', error)
    throw error
  }
}

// AWS SES 发送邮件
async function sendEmailWithAWS(config: AWSConfig, to: string, subject: string, content: string): Promise<boolean> {
  // 这里需要安装 @aws-sdk/client-ses: npm install @aws-sdk/client-ses
  try {
    let SESClient, SendEmailCommand
    try {
      const awsSdk = require('@aws-sdk/client-ses')
      SESClient = awsSdk.SESClient
      SendEmailCommand = awsSdk.SendEmailCommand
    } catch (requireError) {
      throw new Error('@aws-sdk/client-ses 未安装，请运行: npm install @aws-sdk/client-ses')
    }
    
    const client = new SESClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    })

    // 检测内容是否为HTML
    const isHTML = content.trim().startsWith('<!DOCTYPE html') || content.trim().startsWith('<html')

    const messageBody: any = {
      Subject: { Data: subject }
    }

    if (isHTML) {
      messageBody.Body = {
        Html: { Data: content }
      }
    } else {
      messageBody.Body = {
        Text: { Data: content },
        Html: { Data: content.replace(/\n/g, '<br>') }
      }
    }

    const command = new SendEmailCommand({
      Source: `${config.fromName} <${config.from}>`,
      Destination: {
        ToAddresses: [to]
      },
      Message: messageBody
    })

    await client.send(command)
    console.log('AWS SES 邮件发送成功')
    return true
  } catch (error) {
    console.error('AWS SES 发送失败:', error)
    throw error
  }
}

// 开发环境模拟发送邮件
export async function sendEmailDev(to: string, subject: string, content: string): Promise<boolean> {
  console.log('=== 开发环境模拟邮件发送 ===')
  console.log(`收件人: ${to}`)
  console.log(`主题: ${subject}`)
  console.log(`内容: ${content}`)
  console.log('========================')
  
  // 模拟发送延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  return true
} 