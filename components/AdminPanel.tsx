"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Search, Shield, ShieldCheck, Users, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface UserAuditInfo {
  userId: string
  username: string
  email: string
  noContentAudit: boolean
}

export function AdminPanel() {
  const [searchUserId, setSearchUserId] = useState('')
  const [userInfo, setUserInfo] = useState<UserAuditInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 搜索用户
  const handleSearchUser = async () => {
    if (!searchUserId.trim()) {
      toast.error('请输入用户名或用户ID')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/user-audit?query=${encodeURIComponent(searchUserId)}`, {
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        setUserInfo(result.data)
        toast.success('用户信息获取成功')
      } else {
        toast.error(result.error || '获取用户信息失败')
        setUserInfo(null)
      }
    } catch (error) {
      console.error('搜索用户失败:', error)
      toast.error('搜索用户失败')
      setUserInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  // 更新用户审核权限
  const handleUpdateAuditPermission = async (noContentAudit: boolean) => {
    if (!userInfo) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/user-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: userInfo.userId,
          noContentAudit
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('用户权限更新成功')
        // 更新本地状态
        setUserInfo(prev => prev ? {
          ...prev,
          noContentAudit
        } : null)
      } else {
        toast.error(result.error || '更新权限失败')
      }
    } catch (error) {
      console.error('更新权限失败:', error)
      toast.error('更新权限失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">搜索用户</CardTitle>
          <CardDescription>
            输入用户名或用户ID来查找用户
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索用户 */}
          <div className="flex gap-2">
            <Input
              placeholder="输入用户名或用户ID"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearchUser}
              disabled={isLoading}
              size="default"
            >
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 用户信息和权限设置 */}
      {userInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              用户信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">用户ID</p>
              <p className="font-mono">{userInfo.userId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">用户名</p>
              <p className="font-medium">{userInfo.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">邮箱</p>
              <p>{userInfo.email}</p>
            </div>
            
            <div className="pt-4 border-t">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">免审核权限</p>
                    <p className="text-xs text-muted-foreground">
                      {userInfo.noContentAudit 
                        ? "该用户发布内容时会跳过违禁词检测" 
                        : "该用户发布内容时会进行违禁词检测"
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      userInfo.noContentAudit 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-700"
                    )}>
                      {userInfo.noContentAudit ? "已开启" : "已关闭"}
                    </span>
                    <Switch
                      checked={userInfo.noContentAudit}
                      onCheckedChange={handleUpdateAuditPermission}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 