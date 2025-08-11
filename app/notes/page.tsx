"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Plus, 
  Search, 
  FileText, 
  Lock, 
  Calendar, 
  Clock,
  Trash2,
  Eye,
  Share2,
  Download,
  LogIn
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/ui/loading"
import { Header } from "@/components/Header"
import { CreateNoteModal } from "@/components/CreateNoteModal"
import { LoginModal } from "@/components/LoginModal"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { Yiyan } from "@/components/Yiyan"
import { useAuth } from "@/components/AuthProvider"
import { Note } from "@/types"
import { 
  formatDate, 
  formatRelativeTime, 
  downloadMarkdown, 
  copyToClipboard, 
  getShareUrl
} from "@/lib/utils"
import toast from "react-hot-toast"

export default function NotesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [notes, setNotes] = React.useState<Note[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [showLoginModal, setShowLoginModal] = React.useState(false)
  
  // 删除确认对话框状态
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [deleteNoteId, setDeleteNoteId] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Load notes
  React.useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadNotes()
      } else {
        setIsLoading(false)
      }
    }
  }, [user, authLoading])

  const loadNotes = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/notes', {
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setNotes(data.data || [])
      } else {
        if (response.status === 401) {
          toast.error('请先登录')
        } else {
          toast.error(data.error || '加载笔记失败')
        }
      }
    } catch (error) {
      console.error('加载笔记出错:', error)
      toast.error('加载笔记失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (noteId: string) => {
    setDeleteNoteId(noteId)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deleteNoteId) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/notes/${deleteNoteId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const result = await response.json()
      
      if (result.success) {
        setNotes(notes.filter(note => note.id !== deleteNoteId))
        toast.success('笔记已删除')
      } else {
        toast.error(result.error || '删除失败')
      }
    } catch (error) {
      console.error('删除笔记出错:', error)
      toast.error('删除笔记失败，请重试')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeleteNoteId(null)
    }
  }

  const handleShare = async (note: Note) => {
    if (note.shortUrl) {
      const shareUrl = getShareUrl(note.shortUrl)
      await copyToClipboard(shareUrl)
      toast.success('分享链接已复制到剪贴板')
    }
  }

  const handleDownload = (note: Note) => {
    downloadMarkdown(note.title, note.content)
    toast.success('笔记已下载')
  }

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => {
    const title = note.title || ''
    const content = note.content || ''
    const query = searchQuery.toLowerCase()
    
    return title.toLowerCase().includes(query) ||
           content.toLowerCase().includes(query)
  })

  // Show login prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <>
        <div className="min-h-screen flex flex-col">
          <Header />
          
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                  <h1 className="text-3xl font-bold">我的笔记</h1>
                  <p className="text-muted-foreground text-lg">
                    登录后查看和管理您的所有笔记
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Button
                    onClick={() => setShowLoginModal(true)}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    登录查看笔记
                  </Button>
                  
                  <p className="text-sm text-muted-foreground">
                    还没有账号？点击登录按钮即可注册新账号
                  </p>
                </div>
              </motion.div>
            </div>
          </main>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
            >
              <div>
                <h1 className="text-3xl font-bold mb-2">我的笔记</h1>
                <p className="text-muted-foreground">
                  管理您的所有笔记，支持搜索、分享和下载
                </p>
              </div>
              
              <Button
                onClick={() => setShowCreateModal(true)}
                size="lg"
                className="shrink-0"
              >
                <Plus className="h-5 w-5 mr-2" />
                创建笔记
              </Button>
            </motion.div>

            {/* 一言励志语 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Yiyan />
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative max-w-md"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索笔记..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </motion.div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loading size="lg" text="加载笔记中..." />
              </div>
            ) : (
              <>
                {/* Notes Grid */}
                {filteredNotes.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  >
                    {filteredNotes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Card className="card-hover h-full flex flex-col">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="line-clamp-2 text-lg">
                                {note.title}
                              </CardTitle>
                              {note.isPasswordProtected && (
                                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                              )}
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(note.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>{formatRelativeTime(note.updatedAt)}</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                              <Link href={`/note/${note.id}`} className="flex-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  查看
                                </Button>
                              </Link>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleShare(note)}
                                disabled={!note.shortUrl}
                              >
                                <Share2 className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(note)}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(note.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  /* Empty State */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center py-12"
                  >
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {searchQuery ? '未找到匹配的笔记' : '还没有笔记'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery 
                        ? '尝试调整搜索关键词或创建新笔记'
                        : '创建您的第一条笔记开始记录想法'
                      }
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      创建笔记
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>© 2025 优雅记事本. Made with ❤️ for secure and elegant note-taking.</p>
            <div className="flex justify-center gap-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                隐私策略
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                服务条款
              </Link>
              <Link href="/about" className="hover:text-primary transition-colors">
                关于我们
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <CreateNoteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(noteId) => {
          setShowCreateModal(false)
          // 跳转到笔记编辑页面
          if (noteId) {
            router.push(`/note/${noteId}`)
          } else {
            loadNotes()
          }
        }}
      />
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </>
  )
} 