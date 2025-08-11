"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Lock, 
  Trash2, 
  Save,
  Copy,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  ArrowDown,
  Shield,
  ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { MarkdownEditor } from "@/components/ui/markdown-editor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/ui/loading"
import { Header } from "@/components/Header"
import { PasswordModal } from "@/components/PasswordModal"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { Note } from "@/types"
import { 
  formatDate, 
  formatRelativeTime, 
  downloadMarkdown, 
  copyToClipboard, 
  getShareUrl,
  validateTitle,
  validateContent,
  checkBannedWords
} from "@/lib/utils"
import toast from "react-hot-toast"
import Cookies from "js-cookie"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface NotePageProps {
  params: { id: string }
}

export default function NotePage({ params }: NotePageProps) {
  const router = useRouter()
  const [note, setNote] = React.useState<Note | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [hasAccess, setHasAccess] = React.useState(false)
  const [editData, setEditData] = React.useState({ title: '', content: '' })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  
  // 权限相关状态
  const [isOwner, setIsOwner] = React.useState(false)
  
  // 密码设置相关状态
  const [showSetPassword, setShowSetPassword] = React.useState(false)
  const [passwordData, setPasswordData] = React.useState({ password: '', confirmPassword: '' })
  const [isSettingPassword, setIsSettingPassword] = React.useState(false)
  
  // 删除确认对话框状态
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  
  // 懒加载相关状态
  const [displayedContent, setDisplayedContent] = React.useState('')
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const [hasMoreContent, setHasMoreContent] = React.useState(false)
  const [currentLines, setCurrentLines] = React.useState(0)
  const LINES_PER_LOAD = 100

  // 分割内容为行
  const splitContentIntoLines = (content: string) => {
    return content.split('\n')
  }

  // 加载指定行数的内容
  const loadContentLines = (content: string, linesToShow: number) => {
    const lines = splitContentIntoLines(content)
    const displayLines = lines.slice(0, linesToShow)
    setDisplayedContent(displayLines.join('\n'))
    setCurrentLines(linesToShow)
    setHasMoreContent(lines.length > linesToShow)
    
    // 如果总行数少于等于初始加载行数，直接显示全部内容
    if (lines.length <= LINES_PER_LOAD) {
      setDisplayedContent(content)
      setCurrentLines(lines.length)
      setHasMoreContent(false)
    }
  }

  // 加载更多内容
  const loadMoreContent = () => {
    if (!note || !hasMoreContent || isLoadingMore) return

    setIsLoadingMore(true)
    
    // 模拟加载延迟
    setTimeout(() => {
      const lines = splitContentIntoLines(note.content)
      const newLinesToShow = Math.min(currentLines + LINES_PER_LOAD, lines.length)
      const displayLines = lines.slice(0, newLinesToShow)
      
      setDisplayedContent(displayLines.join('\n'))
      setCurrentLines(newLinesToShow)
      setHasMoreContent(lines.length > newLinesToShow)
      setIsLoadingMore(false)
    }, 300) // 300ms 加载延迟
  }

  // 滚动监听
  React.useEffect(() => {
    const handleScroll = () => {
      if (isEditing || !hasMoreContent || isLoadingMore) return

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // 当滚动到距离底部200px时加载更多
      if (scrollTop + windowHeight >= documentHeight - 200) {
        loadMoreContent()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMoreContent, isLoadingMore, isEditing, note])

  // Load note data
  React.useEffect(() => {
    loadNote()
  }, [params.id])

  const loadNote = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/notes/${params.id}`, {
        credentials: 'include'
      })
      const result = await response.json()

      if (result.success) {
        const noteData = result.data
        setNote(noteData)
        setIsOwner(result.isOwner || false)
        
        // 如果是所有者，直接显示内容并允许编辑
        if (result.isOwner) {
          setHasAccess(true)
          setEditData({ title: noteData.title, content: noteData.content })
          loadContentLines(noteData.content, LINES_PER_LOAD)
        } else {
          // 如果不是所有者（分享链接访问）
          if (noteData.isPasswordProtected) {
            // 需要密码验证
            setHasAccess(false)
          } else {
            // 无密码保护，可以直接查看（只读）
            setHasAccess(true)
            loadContentLines(noteData.content, LINES_PER_LOAD)
          }
        }
      } else {
        if (response.status === 401) {
          toast.error('请先登录')
          router.push('/')
        } else if (response.status === 403) {
          toast.error('没有权限访问此笔记')
          router.push('/notes')
        } else {
          toast.error(result.error || '加载笔记失败')
        }
      }
    } catch (error) {
      console.error('加载笔记出错:', error)
      toast.error('加载笔记失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordVerify = async (password: string, captchaToken: string) => {
    try {
      const response = await fetch(`/api/notes/${params.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, captchaToken })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        setHasAccess(true)
        setShowPassword(false)
        setEditData({
          title: note!.title,
          content: note!.content
        })
        loadContentLines(note!.content, LINES_PER_LOAD) // 加载内容
        toast.success('密码验证成功')
      } else {
        throw new Error(result.error || '密码错误')
      }
    } catch (error: any) {
      console.error('密码验证错误:', error)
      toast.error(error.message || '验证失败，请重试')
      throw error
    }
  }

  // 设置笔记密码
  const handleSetPassword = async () => {
    if (!passwordData.password.trim()) {
      toast.error('请输入密码')
      return
    }
    
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }
    
    if (passwordData.password.length < 4) {
      toast.error('密码长度至少4位')
      return
    }

    try {
      setIsSettingPassword(true)
      const response = await fetch(`/api/notes/${params.id}/password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          password: passwordData.password
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setNote({ ...note!, isPasswordProtected: true })
        setShowSetPassword(false)
        setPasswordData({ password: '', confirmPassword: '' })
        toast.success('密码设置成功')
      } else {
        toast.error(result.error || '设置密码失败')
      }
    } catch (error) {
      toast.error('设置密码失败，请重试')
    } finally {
      setIsSettingPassword(false)
    }
  }

  // 移除笔记密码
  const handleRemovePassword = async () => {
    try {
      const response = await fetch(`/api/notes/${params.id}/password`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const result = await response.json()
      
      if (result.success) {
        setNote({ ...note!, isPasswordProtected: false })
        toast.success('密码已移除')
      } else {
        toast.error(result.error || '移除密码失败')
      }
    } catch (error) {
      toast.error('移除密码失败，请重试')
    }
  }

  // 分享笔记
  const handleShare = async () => {
    if (!note) return
    
    try {
      // 使用短链接进行分享，如果没有短链接则使用笔记ID
      const shareUrl = note.shortUrl 
        ? getShareUrl(note.shortUrl)
        : `${window.location.origin}/note/${note.id}`
      
      await navigator.clipboard.writeText(shareUrl)
      toast.success('分享链接已复制到剪贴板')
    } catch (error) {
      toast.error('复制链接失败')
    }
  }

  // 下载笔记
  const handleDownload = () => {
    if (!note) return
    downloadMarkdown(note.title, note.content)
    toast.success('笔记已下载')
  }

  const handleSave = async () => {
    // Validate
    const newErrors: Record<string, string> = {}
    
    const titleValidation = validateTitle(editData.title)
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error!
    }
    
    const contentValidation = validateContent(editData.content)
    if (!contentValidation.isValid) {
      newErrors.content = contentValidation.error!
    }

    // 违禁词检测 - 只检测内容，不检测标题
    const contentFilterResult = await checkBannedWords(editData.content)
    
    if (!contentFilterResult.isValid) {
      // 只显示弹窗提示，不设置错误状态
      toast.error(
        `内容检测到违禁内容：${contentFilterResult.bannedWords.join(', ')}\n请修改后重试`,
        { duration: 5000 }
      )
      return // 直接返回，不继续保存
    }
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch(`/api/notes/${params.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: editData.title,
          content: editData.content
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setNote(result.data)
        setIsEditing(false)
        // 更新懒加载内容
        loadContentLines(result.data.content, LINES_PER_LOAD)
        toast.success('保存成功')
      } else {
        // 处理违禁词错误
        if (result.bannedWords && result.bannedWords.length > 0) {
          toast.error(
            `检测到违禁内容：${result.bannedWords.join(', ')}\n请修改后重试`,
            { duration: 5000 }
          )
        } else {
          toast.error(result.error || '保存失败')
        }
      }
    } catch (error) {
      toast.error('保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/notes/${params.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('笔记已删除')
        router.push('/notes')
      } else {
        toast.error(result.error || '删除失败')
      }
    } catch (error) {
      console.error('删除笔记出错:', error)
      toast.error('删除笔记失败，请重试')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Loading size="lg" text="加载中..." />
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">笔记不存在</h1>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>

            {/* Action Buttons */}
            {hasAccess && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  分享
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  下载
                </Button>
                
                {/* 只有所有者才能看到编辑、密码设置和删除按钮 */}
                {isOwner && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="gap-2"
                    >
                      {isEditing ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {isEditing ? '预览' : '编辑'}
                    </Button>
                    
                    {/* 密码设置按钮 */}
                    {note.isPasswordProtected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemovePassword}
                        className="gap-2 text-orange-600 border-orange-600 hover:bg-orange-50"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        移除密码
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSetPassword(true)}
                        className="gap-2 text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <Shield className="h-4 w-4" />
                        设置密码
                      </Button>
                    )}
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      删除
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {hasAccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Note Info */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      创建于 {formatDate(note.createdAt)}
                      {note.updatedAt !== note.createdAt && (
                        <span>• 更新于 {formatRelativeTime(note.updatedAt)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {note.isPasswordProtected && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                          <Lock className="h-3 w-3" />
                          受保护
                        </span>
                      )}
                      {!isOwner && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          <Share2 className="h-3 w-3" />
                          分享访问
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Note Content */}
              <Card>
                <CardContent className="p-6">
                  {isEditing && isOwner ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">标题</label>
                        <Input
                          value={editData.title}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          className=""
                          placeholder="输入标题..."
                        />

                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">内容</label>
                        <MarkdownEditor
                          value={editData.content}
                          onChange={(value) => setEditData({ ...editData, content: value || '' })}
                          className={errors.content ? 'border-destructive' : ''}
                          placeholder="开始写作..."
                          height={400}
                        />

                        <p className="text-xs text-muted-foreground">
                          {editData.content.length} / 51200 字符
                        </p>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={() => {
                            setIsEditing(false)
                            setEditData({
                              title: note.title,
                              content: note.content
                            })
                            setErrors({})
                            // 重新加载懒加载内容
                            loadContentLines(note.content, LINES_PER_LOAD)
                          }}
                          variant="outline"
                          disabled={isSaving}
                        >
                          取消
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="gap-2"
                        >
                          {isSaving ? (
                            <Loading size="sm" text="保存中..." />
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              保存
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h1 className="text-3xl font-bold">{note.title}</h1>
                      <div className="prose prose-lg max-w-none dark:prose-invert">
                        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                          {displayedContent || '这个笔记还没有内容...'}
                        </pre>
                        
                        {/* 加载更多内容的指示器和按钮 */}
                        {hasMoreContent && (
                          <div className="mt-6 text-center space-y-4">
                            {isLoadingMore ? (
                              <div className="flex items-center justify-center gap-2 py-4">
                                <Loading size="sm" text="正在加载更多内容..." />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">
                                  已显示 {currentLines} 行，还有更多内容
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={loadMoreContent}
                                  className="gap-2"
                                >
                                  <ArrowDown className="h-4 w-4" />
                                  加载更多内容
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!hasMoreContent && currentLines > 0 && (
                          <div className="mt-6 text-center text-sm text-muted-foreground">
                            已显示全部内容 ({currentLines} 行)
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">此笔记受密码保护</h2>
              <p className="text-muted-foreground mb-6">请输入密码以查看内容</p>
              <Button onClick={() => setShowPassword(true)}>
                输入密码
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 密码设置对话框 */}
      <Dialog open={showSetPassword} onOpenChange={setShowSetPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>设置笔记密码</DialogTitle>
            <DialogDescription>
              为此笔记设置密码保护，只有输入正确密码才能查看内容
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">密码</label>
              <PasswordInput
                placeholder="请输入密码（至少4位）"
                value={passwordData.password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">确认密码</label>
              <PasswordInput
                placeholder="请再次输入密码"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSetPassword(false)
                setPasswordData({ password: '', confirmPassword: '' })
              }}
              disabled={isSettingPassword}
            >
              取消
            </Button>
            <Button
              onClick={handleSetPassword}
              disabled={isSettingPassword}
              className="gap-2"
            >
              {isSettingPassword ? (
                <Loading size="sm" text="设置中..." />
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  设置密码
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PasswordModal
        open={showPassword}
        onOpenChange={setShowPassword}
        onVerify={handlePasswordVerify}
        noteTitle={note?.title}
      />
      
      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="删除笔记"
        description="确定要删除这个笔记吗？"
        isLoading={isDeleting}
      />
      
      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 优雅记事本. Made with ❤️ for secure and elegant note-taking.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 