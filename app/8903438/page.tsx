"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { AdminPanel } from '@/components/AdminPanel'
import { useAuth } from '@/components/AuthProvider'
import { Loading } from '@/components/ui/loading'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle } from 'lucide-react'

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setHasAdminAccess(false)
        return
      }

      // 检查管理员权限
      const checkAdminAccess = async () => {
        try {
          // 使用调试API来验证当前用户是否为管理员
          const response = await fetch('/api/debug/admin-config')
          
          if (response.ok) {
            const result = await response.json()
            
            if (result.success) {
              setHasAdminAccess(result.data.isCurrentUserAdmin)
            } else {
              setHasAdminAccess(false)
            }
          } else {
            setHasAdminAccess(false)
          }
        } catch (error) {
          setHasAdminAccess(false)
        }
      }

      checkAdminAccess()
    }
  }, [user?.id, authLoading])

  if (authLoading || hasAdminAccess === null) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Loading size="lg" text="验证权限中..." />
        </div>
      </div>
    )
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {!user ? '需要登录' : '访问被拒绝'}
              </CardTitle>
              <CardDescription>
                {!user 
                  ? '请先登录您的账户' 
                  : '您没有访问管理员面板的权限'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {!user 
                  ? '管理员面板需要登录后才能访问。请点击右上角登录按钮进行登录。' 
                  : '只有系统管理员才能访问此页面。如果您认为这是错误，请联系系统管理员。'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            管理员面板
          </h1>
          <p className="text-muted-foreground mt-2">
            管理用户的内容审核权限。支持通过用户名或用户ID搜索用户。
          </p>
        </div>
        <AdminPanel />
      </div>
    </div>
  )
} 