"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/components/AuthProvider'
import { AlertTriangle, ArrowLeft, Trash2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function DeactivatePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // 如果未登录，跳转到首页
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  // 如果未登录，显示加载状态
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">正在跳转...</p>
        </div>
      </div>
    )
  }

  const handleDeactivate = async () => {
    if (!password) {
      toast.error('请输入当前密码')
      return
    }

    if (confirmText !== '删除我的账号') {
      toast.error('请输入正确的确认文本')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/deactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          confirmText
        }),
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        toast.success('账号已成功注销')
        await logout()
        router.push('/')
      } else {
        toast.error(result.error || '注销失败，请稍后重试')
      }
    } catch (error) {
      toast.error('注销失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 返回按钮 */}
        <Link href="/notes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回我的笔记
        </Link>

        <Card className="p-6">
          <div className="space-y-6">
            {/* 头部警告 */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-500">注销账号</h1>
              <p className="text-muted-foreground">
                此操作将永久删除您的账号和所有数据
              </p>
            </div>

            {/* 风险提示 */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-medium text-red-800 dark:text-red-200">
                    注销账号将导致以下不可逆后果：
                  </h3>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• 永久删除您的用户账号</li>
                    <li>• 删除您创建的所有笔记</li>
                    <li>• 删除所有分享链接</li>
                    <li>• 清除所有个人数据</li>
                    <li>• 此操作无法撤销</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 用户信息确认 */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                即将注销的账号信息
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>用户名：</strong>{user.username}</p>
                <p><strong>邮箱：</strong>{user.email}</p>
                <p><strong>注册时间：</strong>{
                  (() => {
                    try {
                      if (user.createdAt) {
                        const date = new Date(user.createdAt)
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        }
                      }
                      return '未知'
                    } catch {
                      return '未知'
                    }
                  })()
                }</p>
              </div>
            </div>

            {!showConfirm ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  如果您确定要注销账号，请点击下方按钮继续
                </p>
                <Button
                  onClick={() => setShowConfirm(true)}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-500 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  我要注销账号
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 密码确认 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    输入当前密码确认身份
                  </label>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="输入您的当前密码"
                    required
                  />
                </div>

                {/* 确认文本 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    输入 <span className="text-red-600 font-bold">"删除我的账号"</span> 确认操作
                  </label>
                  <Input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="删除我的账号"
                    required
                  />
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowConfirm(false)}
                    disabled={isLoading}
                  >
                    取消
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDeactivate}
                    disabled={isLoading || !password || confirmText !== '删除我的账号'}
                  >
                    {isLoading ? '正在注销...' : '确认注销'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 安全提示 */}
        <div className="text-center text-xs text-muted-foreground">
          <p>如果您只是想暂时停用账号，可以联系客服寻求帮助</p>
          <p className="mt-1">客服邮箱: service@4is.cc</p>
        </div>
      </div>
    </div>
  )
} 