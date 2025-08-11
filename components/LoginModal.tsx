"use client"

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { PasswordInput } from './ui/password-input'
import { Shield, Mail, Eye, EyeOff } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { CaptchaWidget } from './ui/captcha'
import { ForgotPasswordModal } from './ForgotPasswordModal'
import { EmailVerification } from './EmailVerification'
import toast from 'react-hot-toast'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'email-verify'>('login')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    emailCode: ''
  })
  const [captchaValue, setCaptchaValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [captchaError, setCaptchaError] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(true)
  const [agreedToTerms, setAgreedToTerms] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailCountdown, setEmailCountdown] = useState(0)
  const [tempToken, setTempToken] = useState('')
  const captchaRef = useRef<any>(null)
  const emailIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { login, register, user } = useAuth()

  // 监听用户状态变化，如果用户退出登录则清空表单
  useEffect(() => {
    if (!user) {
      // 用户已退出登录，清空所有表单数据
      setFormData({ username: '', password: '', confirmPassword: '', email: '', emailCode: '' })
      setCaptchaValue('')
      setCaptchaError(false)
      setAgreedToPrivacy(true)
      setAgreedToTerms(true)
      // 刷新验证码
      if (captchaRef.current) {
        captchaRef.current.refresh()
      }
    }
  }, [user])

  // 当模态框打开时，确保表单是干净的
  useEffect(() => {
    if (isOpen && !user) {
      setFormData({ username: '', password: '', confirmPassword: '', email: '', emailCode: '' })
      setCaptchaValue('')
      setCaptchaError(false)
      setAgreedToPrivacy(true)
      setAgreedToTerms(true)
      setMode('login')
      // 刷新验证码
      setTimeout(() => {
        if (captchaRef.current) {
          captchaRef.current.refresh()
        }
      }, 100)
    }
  }, [isOpen, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username || !formData.password) {
      toast.error('请填写完整信息')
      return
    }

    // 注册模式下验证密码确认
    if (mode === 'register') {
      if (!formData.confirmPassword) {
        toast.error('请确认密码')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('两次输入的密码不一致')
        return
      }
    }

    if (!captchaValue.trim()) {
      toast.error('请输入验证码')
      return
    }

    // 检查协议同意状态
    if (mode === 'login' && !agreedToPrivacy) {
      toast.error('请阅读并同意隐私策略')
      return
    }

    if (mode === 'register' && (!agreedToPrivacy || !agreedToTerms)) {
      toast.error('请阅读并同意隐私策略和服务条款')
      return
    }

    // 验证验证码
    const captchaWidget = captchaRef.current
    if (!captchaWidget) {
      toast.error('验证码组件未加载')
      return
    }

    setIsLoading(true)

    try {
      // 手动验证验证码并获取 token
      const isValidCaptcha = captchaWidget.verify?.()
      if (!isValidCaptcha) {
        toast.error('验证码错误')
        setCaptchaValue('')
        setCaptchaError(true)
        // 刷新验证码
        setTimeout(() => {
          captchaRef.current?.refresh?.()
        }, 100)
        setIsLoading(false)
        return
      }

      // 生成验证码 token
      const captchaToken = 'image-captcha-' + Date.now()

      if (mode === 'login') {
        await login(formData.username, formData.password, captchaToken)
        toast.success('登录成功！')
        handleClose()
      } else {
        await register(formData.username, formData.password, formData.email, formData.emailCode, captchaToken)
        toast.success('注册成功！')
        handleClose()
      }
    } catch (error: any) {
      // 根据错误类型显示不同的错误信息
      let errorMessage = error.message || `${mode === 'login' ? '登录' : '注册'}失败`
      
      // 优化错误信息显示
          if (errorMessage.includes('用户名/邮箱或密码错误') || errorMessage.includes('用户名或密码错误')) {
      errorMessage = mode === 'login' ? '用户名/邮箱或密码错误，请检查后重试' : errorMessage
      } else if (errorMessage.includes('用户名已存在')) {
        errorMessage = '该用户名已被注册，请更换用户名'
      } else if (errorMessage.includes('验证码')) {
        errorMessage = '验证码错误，请重新输入'
      }
      
      toast.error(errorMessage)
      // 重置验证码
      setCaptchaValue('')
      setCaptchaError(true)
      // 刷新验证码
      setTimeout(() => {
        captchaRef.current?.refresh?.()
      }, 100)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    // 完全清空所有表单数据
    setFormData({ username: '', password: '', confirmPassword: '', email: '', emailCode: '' })
    setCaptchaValue('')
    setCaptchaError(false)
    setIsLoading(false)
    setMode('login')
    setTempToken('')
    setEmailCountdown(0)
    if (emailIntervalRef.current) {
      clearInterval(emailIntervalRef.current)
    }
    // 刷新验证码
    if (captchaRef.current) {
      captchaRef.current.refresh()
    }
    onClose()
  }

  const handleModeSwitch = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    // 切换模式时也清空表单
    setFormData({ username: '', password: '', confirmPassword: '', email: '', emailCode: '' })
    setCaptchaValue('')
    setCaptchaError(false)
    setTempToken('')
    setEmailCountdown(0)
    if (emailIntervalRef.current) {
      clearInterval(emailIntervalRef.current)
    }
    // 刷新验证码
    if (captchaRef.current) {
      captchaRef.current.refresh()
    }
  }

  const handleCaptchaVerify = (token: string) => {
    // 这个回调现在主要用于显示验证成功状态
    console.log('Captcha verified with token:', token)
  }

  const handleCaptchaError = () => {
    toast.error('验证失败，请重试')
    setCaptchaValue('')
    setCaptchaError(true)
    // 刷新验证码
    setTimeout(() => {
      captchaRef.current?.refresh?.()
    }, 100)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-full max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {mode === 'login' ? '登录账号' : '注册账号'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? '登录以管理您的笔记' : '创建账号开始使用'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <span>用户名/邮箱</span>
            </label>
            <Input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="输入用户名或邮箱"
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <span>密码</span>
            </label>
            <PasswordInput
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="输入密码"
              autoComplete="off"
              required
            />
          </div>

          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span>确认密码</span>
                </label>
                <PasswordInput
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="再次输入密码"
                  autoComplete="off"
                  required
                />
              </div>

              <EmailVerification
                email={formData.email}
                onEmailChange={(email) => setFormData({ ...formData, email })}
                onCodeChange={(code) => setFormData({ ...formData, emailCode: code })}
                onVerified={(token) => setTempToken(token)}
                type="register"
                disabled={isLoading}
              />
            </>
          )}

          <div className="space-y-2">
            <CaptchaWidget
              ref={captchaRef}
              onVerify={handleCaptchaVerify}
              onError={handleCaptchaError}
              value={captchaValue}
              onChange={(value) => {
                setCaptchaValue(value)
                if (captchaError) {
                  setCaptchaError(false)
                }
              }}
              hasError={captchaError}
            />
          </div>

          {/* 协议勾选区域 */}
          <div className="space-y-3 pt-2">
            {mode === 'login' ? (
              /* 登录模式：只显示隐私策略 */
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="privacy-agreement"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="privacy-agreement" className="text-sm text-muted-foreground">
                  我已阅读并同意{' '}
                  <a 
                    href="/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline"
                  >
                    隐私策略
                  </a>
                </label>
              </div>
            ) : (
              /* 注册模式：合并显示隐私策略和服务条款 */
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agreements"
                  checked={agreedToPrivacy && agreedToTerms}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setAgreedToPrivacy(checked)
                    setAgreedToTerms(checked)
                  }}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="agreements" className="text-sm text-muted-foreground">
                  我已阅读并同意{' '}
                  <a 
                    href="/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline"
                  >
                    隐私策略
                  </a>
                  {' '}和{' '}
                  <a 
                    href="/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline"
                  >
                    服务条款
                  </a>
                </label>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={
              isLoading || 
              !captchaValue.trim() || 
              !agreedToPrivacy || 
              (mode === 'register' && (!agreedToTerms || !tempToken))
            }
          >
            {isLoading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
          </Button>
        </form>

        <div className="text-center space-y-2">
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors text-right w-full"
            >
              忘记密码？
            </button>
          )}
          
          <button
            type="button"
            onClick={handleModeSwitch}
            className="text-sm text-muted-foreground hover:text-foreground block text-right w-full"
          >
            {mode === 'login' ? '没有注册账号？点击注册' : '已有账号？点击登录'}
          </button>
        </div>
      </DialogContent>
    </Dialog>

      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  )
} 