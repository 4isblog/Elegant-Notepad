"use client"

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Check } from 'lucide-react'

interface CaptchaProps {
  onVerify: (token: string) => void
  onError?: () => void
  className?: string
  value?: string
  onChange?: (value: string) => void
  hasError?: boolean
}

interface CaptchaRef {
  verify: () => boolean
  refresh: () => void
}

export const CaptchaWidget = forwardRef<CaptchaRef, CaptchaProps>(
  ({ onVerify, onError, className, value = '', onChange, hasError = false }, ref) => {
      const canvasRef = useRef<HTMLCanvasElement>(null)
  const [captchaText, setCaptchaText] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [internalError, setInternalError] = useState(false)

    // 生成随机验证码文本（4位）
    const generateCaptchaText = () => {
      const chars = '0123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz'
      let result = ''
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    // 绘制验证码
    const drawCaptcha = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const text = generateCaptchaText()
      setCaptchaText(text)

      // 设置画布尺寸
      canvas.width = 80
      canvas.height = 40

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 绘制背景渐变
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#f8f9fa')
      gradient.addColorStop(1, '#e9ecef')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制干扰线
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `hsl(${Math.random() * 360}, 30%, 80%)`
        ctx.lineWidth = Math.random() * 1.5 + 0.5
        ctx.beginPath()
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
        ctx.stroke()
      }

      // 绘制干扰点
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 40%, 70%)`
        ctx.beginPath()
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 1.5 + 0.5,
          0,
          2 * Math.PI
        )
        ctx.fill()
      }

      // 绘制文字
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const x = (canvas.width / (text.length + 1)) * (i + 1)
        const y = canvas.height / 2 + (Math.random() - 0.5) * 6
        
        // 随机字体大小和颜色
        const fontSize = Math.random() * 4 + 16
        ctx.font = `bold ${fontSize}px Arial, sans-serif`
        ctx.fillStyle = `hsl(${Math.random() * 360}, 60%, 40%)`
        
        // 随机旋转
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate((Math.random() - 0.5) * 0.3)
        ctx.fillText(char, 0, 0)
        ctx.restore()
      }

      // 添加边框
      ctx.strokeStyle = '#ced4da'
      ctx.lineWidth = 1
      ctx.strokeRect(0, 0, canvas.width, canvas.height)
    }

    useEffect(() => {
      drawCaptcha()
    }, [])

    // 监听输入变化，清除内部错误状态
    useEffect(() => {
      if (value && internalError) {
        setInternalError(false)
      }
    }, [value, internalError])

    const handleRefresh = () => {
      // 强制重新生成验证码
      setTimeout(() => {
        drawCaptcha()
      }, 10)
      onChange?.('')
      setIsVerified(false)
      setInternalError(false)
    }

    // 验证函数，供外部调用
    const verify = () => {
      if (!value.trim()) {
        return false
      }
      
      if (value.toLowerCase() === captchaText.toLowerCase()) {
        setIsVerified(true)
        setInternalError(false)
        onVerify('image-captcha-' + Date.now())
        return true
      } else {
        setInternalError(true)
        onError?.()
        return false
      }
    }

    // 暴露验证函数和刷新函数给父组件
    useImperativeHandle(ref, () => ({
      verify,
      refresh: handleRefresh
    }))

    if (isVerified) {
      return (
        <div className={className}>
          <div className="border border-green-200 rounded-lg p-3 text-center bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <Check className="h-4 w-4 mx-auto mb-1 text-green-600 dark:text-green-400" />
            <p className="text-xs text-green-600 dark:text-green-400">
              验证成功
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className={`w-full ${className || ''}`}>
        <div className="space-y-2 w-full">
          {/* 验证码标签 */}
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            验证码
          </label>
          
          {/* 验证码图片和输入框组合 */}
          <div className="relative w-full">
            <div className={`flex items-center border rounded-lg bg-white dark:bg-gray-800 overflow-hidden transition-colors duration-200 w-full ${
              hasError || internalError 
                ? 'border-red-500 dark:border-red-400' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}>
              {/* 验证码图片 */}
              <div className="flex-shrink-0">
                <canvas
                  ref={canvasRef}
                  className="cursor-pointer hover:opacity-80 transition-opacity block"
                  onClick={handleRefresh}
                  title="点击刷新验证码"
                  style={{ maxWidth: '80px', height: '40px' }}
                />
              </div>
              
              {/* 分隔线 */}
              <div className={`w-px h-8 transition-colors duration-200 ${
                hasError || internalError 
                  ? 'bg-red-300 dark:bg-red-500' 
                  : 'bg-gray-200 dark:bg-gray-600'
              }`}></div>
              
              {/* 输入框 */}
              <input
                type="text"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className="flex-1 min-w-0 h-10 px-3 py-2 bg-transparent border-0 text-center text-sm font-mono tracking-wider focus:outline-none focus:ring-0 dark:text-white"
                placeholder="输入验证码"
                maxLength={4}
              />
            </div>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            不区分大小写，点击左侧图片可刷新
          </p>
        </div>
      </div>
    )
  }
)

CaptchaWidget.displayName = 'CaptchaWidget' 