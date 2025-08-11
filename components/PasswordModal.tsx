"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Lock, Eye, EyeOff, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loading } from "@/components/ui/loading"
import { CaptchaWidget } from "@/components/ui/captcha"
import toast from "react-hot-toast"

interface PasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerify: (password: string, captchaToken: string) => Promise<void>
  noteTitle?: string
}

export function PasswordModal({ open, onOpenChange, onVerify, noteTitle }: PasswordModalProps) {
  const [password, setPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [captchaToken, setCaptchaToken] = React.useState('')
  const [captchaValue, setCaptchaValue] = React.useState('')
  const [error, setError] = React.useState('')
  const captchaRef = React.useRef<any>(null)

  // 错误状态现在通过toast显示，不需要监控了

  // 只在模态框从关闭变为打开时重置状态
  const [wasOpen, setWasOpen] = React.useState(false)
  React.useEffect(() => {
    if (open && !wasOpen) {
      // 只在首次打开时重置，避免重复重置
      setPassword('')
      setCaptchaToken('')
      setCaptchaValue('')
      setError('')
      setIsLoading(false)
      // 刷新验证码
      if (captchaRef.current) {
        setTimeout(() => {
          captchaRef.current?.refresh?.()
        }, 100)
      }
    }
    setWasOpen(open)
  }, [open, wasOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim()) {
      setError('请输入密码')
      return
    }

    if (!captchaValue.trim()) {
      setError('请输入验证码')
      return
    }

    // 验证验证码
    const captchaWidget = captchaRef.current
    if (!captchaWidget) {
      setError('验证码组件未加载')
      return
    }

    const isValidCaptcha = captchaWidget.verify?.()
    if (!isValidCaptcha) {
      setError('验证码错误')
      setCaptchaValue('')
      setTimeout(() => {
        captchaRef.current?.refresh?.()
      }, 100)
      return
    }

    // 验证码验证成功，生成临时token
    const tempCaptchaToken = `image-captcha-${Date.now()}-${Math.random().toString(36).substring(2)}`

    setIsLoading(true)
    setError('')

    try {
      await onVerify(password, tempCaptchaToken)
      // 验证成功，清理状态但不关闭模态框（由父组件控制）
      setPassword('')
      setCaptchaValue('')
      setCaptchaToken('')
      setError('')
    } catch (error: any) {
      const errorMessage = error.message || '密码错误'
      
      // 使用toast显示错误信息，而不是在模态框内显示
      toast.error(errorMessage)
      
      setCaptchaValue('') // 重置验证码
      setCaptchaToken('')
      // 延迟刷新验证码
      setTimeout(() => {
        captchaRef.current?.refresh?.()
      }, 100)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setPassword('')
    setCaptchaToken('')
    setCaptchaValue('')
    setError('')
    setIsLoading(false)
    // 刷新验证码
    if (captchaRef.current) {
      captchaRef.current.refresh()
    }
    onOpenChange(false)
  }

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token)
  }

  const handleCaptchaError = () => {
    toast.error('验证失败，请重试')
    setCaptchaToken('')
    setCaptchaValue('')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            🔒 输入密码
          </DialogTitle>
          <DialogDescription className="text-center">
            {noteTitle ? `笔记 "${noteTitle}" 需要密码访问` : '此笔记需要密码访问'}
          </DialogDescription>
        </DialogHeader>

        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              密码
            </label>
            <PasswordInput
              id="password"
              placeholder="输入笔记密码"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
              }}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <CaptchaWidget
              ref={captchaRef}
              onVerify={handleCaptchaVerify}
              onError={handleCaptchaError}
              value={captchaValue}
              onChange={(value) => {
                setCaptchaValue(value)
              }}
            />
          </div>



          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading || !password.trim() || !captchaValue.trim()}
            >
              {isLoading ? (
                <Loading size="sm" text="验证中..." />
              ) : (
                '确认'
              )}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
} 