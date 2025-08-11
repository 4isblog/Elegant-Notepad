"use client"

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { PasswordInput } from './ui/password-input'
import { Card } from './ui/card'
import { useAuth } from './AuthProvider'
import { CaptchaWidget } from './ui/captcha'
import { checkBannedWords } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CreateNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (noteId?: string) => void
}

export function CreateNoteModal({ isOpen, onClose, onSuccess }: CreateNoteModalProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaValue, setCaptchaValue] = useState('')
  const captchaRef = useRef<any>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    password: '',
    customShortUrl: ''
  })

  // 内容验证 - CreateNoteModal只创建笔记标题，不需要内容验证
  const validateContent = async () => {
    // 创建笔记时不检测违禁词，在编辑内容时再检测
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('请填写标题')
      return
    }

    // 验证验证码
    if (!captchaValue.trim()) {
      toast.error('请输入验证码')
      return
    }

    const captchaWidget = captchaRef.current
    if (!captchaWidget) {
      toast.error('验证码组件未加载')
      return
    }

    const isValidCaptcha = captchaWidget.verify?.()
    if (!isValidCaptcha) {
      toast.error('验证码错误')
      setCaptchaValue('')
      setTimeout(() => {
        captchaRef.current?.refresh?.()
      }, 100)
      return
    }

    // 验证码验证成功，生成临时token
    const tempCaptchaToken = `image-captcha-${Date.now()}-${Math.random().toString(36).substring(2)}`

    // 验证违禁词
    if (!(await validateContent())) {
      return
    }

    // 验证自定义短链接
    if (formData.customShortUrl) {
      const shortUrlPattern = /^[a-zA-Z0-9_-]+$/
      if (!shortUrlPattern.test(formData.customShortUrl)) {
        toast.error('短链接只能包含字母、数字、下划线和连字符')
        return
      }
      if (formData.customShortUrl.length < 3 || formData.customShortUrl.length > 50) {
        toast.error('短链接长度应在3-50个字符之间')
        return
      }
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          content: '', // 创建空内容的笔记
          password: formData.password.trim() || undefined,
          customShortUrl: formData.customShortUrl.trim() || undefined,
          captchaToken: tempCaptchaToken
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '创建失败')
      }

      const result = await response.json()
      toast.success('笔记创建成功')
      handleClose()
      onSuccess(result.data?.id)
    } catch (error: any) {
      toast.error(error.message || '创建失败')
      setCaptchaToken('') // 重置验证码
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      password: '',
      customShortUrl: ''
    })
    setCaptchaToken('')
    setCaptchaValue('')
    setShowAdvanced(false)
    setIsLoading(false)
    // 刷新验证码
    if (captchaRef.current) {
      captchaRef.current.refresh()
    }
    onClose()
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>创建新笔记</DialogTitle>
          {!user && (
            <span className="text-sm text-muted-foreground">
              登录后可以管理和编辑您的笔记
            </span>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              标题 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="输入笔记标题"
              required
            />
          </div>

          {/* 图形验证码 */}
          <div className="space-y-2">
            <CaptchaWidget
              ref={captchaRef}
              onVerify={handleCaptchaVerify}
              onError={handleCaptchaError}
              value={captchaValue}
              onChange={setCaptchaValue}
            />
          </div>

          {/* 高级选项 */}
          <div className="pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm"
            >
              {showAdvanced ? '隐藏' : '显示'}高级选项
            </Button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-3">🔒 密码保护</h4>
                  <PasswordInput
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="设置访问密码（可选）"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    设置后，访问此笔记需要输入密码
                  </p>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-3">🔗 自定义短链接</h4>
                  <div className="space-y-2">
                    <Input
                      value={formData.customShortUrl}
                      onChange={(e) => setFormData({ ...formData, customShortUrl: e.target.value })}
                      placeholder="自定义短链后缀（可选）"
                    />
                    {formData.customShortUrl && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        预览链接: /s/{formData.customShortUrl}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• 只能包含字母、数字、下划线和连字符</p>
                      <p>• 长度3-50个字符</p>
                      <p>• 如果不设置，系统将自动生成随机短链</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              取消
            </Button>
                        <Button 
              type="submit"
              disabled={isLoading || !captchaValue.trim()}
            >
              {isLoading ? '创建中...' : '创建笔记'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 