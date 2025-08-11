"use client"

import { useAuth } from '@/components/AuthProvider'
import { Header } from '@/components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Copy, Settings, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface AdminConfig {
  currentUser: {
    userId: string
    username: string
  } | null
  adminUserIds: string
  adminIdsArray: string[]
  isCurrentUserAdmin: boolean
  envVariableExists: boolean
}

interface RedisDebugData {
  totalUserKeys: number
  totalUsernameKeys: number
  sampleUserData: Record<string, any>
  usernameMapping: Record<string, any>
  allUserKeys: string[]
  allUsernameKeys: string[]
}

export default function DebugUserPage() {
  const { user } = useAuth()
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null)
  const [redisDebug, setRedisDebug] = useState<RedisDebugData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  }

  const fetchAdminConfig = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/debug/admin-config')
      const result = await response.json()
      if (result.success) {
        setAdminConfig(result.data)
      } else {
        toast.error('获取配置失败')
      }
    } catch (error) {
      toast.error('获取配置失败')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRedisDebug = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/debug/redis-keys')
      const result = await response.json()
      if (result.success) {
        setRedisDebug(result.data)
        toast.success('Redis数据获取成功')
      } else {
        toast.error('获取Redis数据失败')
      }
    } catch (error) {
      toast.error('获取Redis数据失败')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAdminConfig()
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>用户信息调试</CardTitle>
              <CardDescription>请先登录查看用户信息</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              用户信息调试
            </CardTitle>
            <CardDescription>
              当前登录用户的详细信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">用户ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {user.id}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(user.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">用户名</p>
                    <p className="text-sm text-muted-foreground">
                      {user.username}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(user.username)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">邮箱</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(user.email)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">免审核权限</p>
                <p className="text-sm text-muted-foreground">
                  {user.noContentAudit ? '✅ 已开启' : '❌ 未开启'}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                💡 将用户ID复制到环境变量 <code className="bg-muted px-1 rounded">ADMIN_USER_IDS</code> 中即可获得管理员权限
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 管理员配置调试 */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              管理员配置调试
            </CardTitle>
            <CardDescription>
              检查环境变量和权限配置
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Button 
                onClick={fetchAdminConfig} 
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                刷新配置
              </Button>
            </div>

            {adminConfig && (
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">环境变量状态</p>
                  <p className="text-sm text-muted-foreground">
                    {adminConfig.envVariableExists ? '✅ 已配置' : '❌ 未配置'}
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">ADMIN_USER_IDS 值</p>
                      <p className="text-sm text-muted-foreground font-mono break-all">
                        {adminConfig.adminUserIds || '(空)'}
                      </p>
                    </div>
                    {adminConfig.adminUserIds && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(adminConfig.adminUserIds)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">解析后的管理员ID列表</p>
                  <div className="text-sm text-muted-foreground">
                    {adminConfig.adminIdsArray.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {adminConfig.adminIdsArray.map((id, index) => (
                          <li key={index} className="font-mono">{id}</li>
                        ))}
                      </ul>
                    ) : (
                      '(无)'
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">当前用户权限检查</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>当前用户ID: <code className="font-mono">{user.id}</code></p>
                    <p>是否为管理员: {adminConfig.isCurrentUserAdmin ? '✅ 是' : '❌ 否'}</p>
                    {!adminConfig.isCurrentUserAdmin && (
                      <p className="text-red-600">
                        ⚠️ 当前用户ID不在管理员列表中
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 