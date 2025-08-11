"use client"

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email')
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [tempToken, setTempToken] = useState('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // 重置表单
  const resetForm = () => {
    setStep('email')
    setFormData({
      email: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: ''
    })
    setTempToken('')
    setCountdown(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  // 当模态框关闭时重置表单
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  // 发送验证码
  const sendVerificationCode = async () => {
    if (!formData.email) {
      toast.error('请输入邮箱地址')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
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
          email: formData.email,
          type: 'reset'
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
  const verifyEmailCode = async () => {
    if (!formData.verificationCode) {
      toast.error('请输入验证码')
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
          email: formData.email,
          code: formData.verificationCode,
          type: 'reset'
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        setTempToken(result.tempToken)
        setStep('reset')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('验证失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 重置密码
  const resetPassword = async () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('请填写完整信息')
      return
    }

    if (formData.newPassword.length < 6) {
      toast.error('密码长度至少为6位')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword,
          tempToken: tempToken
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        onClose()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('重置密码失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 'email') {
      sendVerificationCode()
    } else if (step === 'verify') {
      verifyEmailCode()
    } else if (step === 'reset') {
      resetPassword()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lock className="h-5 w-5" />
            找回密码
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 'email' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  邮箱地址
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="输入注册时使用的邮箱"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  我们将向您的邮箱发送验证码
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? '发送中...' : '发送验证码'}
              </Button>
            </>
          )}

          {step === 'verify' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  邮箱验证码
                </label>
                <Input
                  type="text"
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                  placeholder="输入6位验证码"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  验证码已发送到 {formData.email}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={countdown > 0}
                  onClick={sendVerificationCode}
                >
                  {countdown > 0 ? `重发 (${countdown}s)` : '重新发送'}
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? '验证中...' : '验证'}
                </Button>
              </div>
            </>
          )}

          {step === 'reset' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  新密码
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="输入新密码（至少6位）"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  确认新密码
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="再次输入新密码"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? '重置中...' : '重置密码'}
              </Button>
            </>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 