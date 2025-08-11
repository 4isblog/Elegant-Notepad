"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'

interface EmailVerificationProps {
  email: string
  onEmailChange: (email: string) => void
  onCodeChange: (code: string) => void
  onVerified: (tempToken: string) => void
  type: 'register' | 'reset'
  disabled?: boolean
}

export function EmailVerification({ 
  email, 
  onEmailChange, 
  onCodeChange, 
  onVerified, 
  type,
  disabled = false 
}: EmailVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [step, setStep] = useState<'email' | 'verify'>('email')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // 发送验证码
  const sendVerificationCode = async () => {
    if (!email) {
      toast.error('请输入邮箱地址')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('请输入有效的邮箱地址')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        setStep('verify')
        startCountdown()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('发送验证码失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 开始倒计时
  const startCountdown = () => {
    setCountdown(60)
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // 验证邮箱验证码
  const verifyEmailCode = async (code: string) => {
    if (!code) {
      return
    }

    if (code.length !== 6) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          type
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        onCodeChange(code)
        onVerified(result.tempToken)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('验证失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理验证码输入变化
  const handleCodeChange = (value: string) => {
    setVerificationCode(value)
    if (value.length === 6) {
      verifyEmailCode(value)
    }
  }

  if (step === 'email') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            邮箱地址
          </label>
          <div className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="输入邮箱地址"
              disabled={disabled}
              required
              className="flex-1"
            />
            <Button 
              type="button"
              disabled={isLoading || disabled}
              onClick={sendVerificationCode}
              className="whitespace-nowrap"
            >
              {isLoading ? '发送中...' : '发送验证码'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Mail className="h-4 w-4" />
          邮箱地址
        </label>
        <div className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="输入邮箱地址"
            disabled={true}
            required
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            disabled={countdown > 0 || disabled}
            onClick={sendVerificationCode}
            className="whitespace-nowrap"
          >
            {countdown > 0 ? `重发 (${countdown}s)` : '重新发送'}
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">
          邮箱验证码
        </label>
        <Input
          type="text"
          value={verificationCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder="输入6位验证码"
          maxLength={6}
          disabled={disabled || isLoading}
          required
        />
        <p className="text-xs text-muted-foreground">
          验证码已发送到 {email}，输入后自动验证
          {isLoading && <span className="ml-2 text-blue-500">验证中...</span>}
        </p>
      </div>
    </div>
  )
} 