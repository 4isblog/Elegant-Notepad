"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  FileText, 
  Lock, 
  Share2, 
  Download, 
  Zap, 
  Shield, 
  Smartphone,
  ArrowRight,
  Plus,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/Header"
import { CreateNoteModal } from "@/components/CreateNoteModal"
import { LoginModal } from "@/components/LoginModal"
import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const features = [
  {
    icon: Lock,
    title: "密码保护",
    description: "使用加密技术保护您的敏感笔记",
    gradient: "from-red-500 to-pink-500"
  },
  {
    icon: Share2,
    title: "短链接分享",
    description: "为您的笔记生成可分享的短链接",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Download,
    title: "Markdown 导出",
    description: "下载精美格式的 .md 文件",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Zap,
    title: "极速性能",
    description: "基于 Next.js 14 构建，优化加载速度",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    icon: Shield,
    title: "安全可靠",
    description: "高级安全功能和数据保护",
    gradient: "from-purple-500 to-indigo-500"
  },
  {
    icon: Smartphone,
    title: "移动友好",
    description: "响应式设计，适配所有设备",
    gradient: "from-teal-500 to-green-500"
  }
]

export default function HomePage() {
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [showLoginModal, setShowLoginModal] = React.useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleStartWriting = () => {
    if (!user) {
      toast.error('请登录后继续创建你的笔记')
      setShowLoginModal(true)
      return
    }
    setShowCreateModal(true)
  }

  // 监听用户登录状态变化
  React.useEffect(() => {
    // 如果用户刚刚登录且登录模态框是打开的，关闭登录模态框并跳转到笔记页面
    if (user && showLoginModal) {
      setShowLoginModal(false)
      // 稍微延迟一下再跳转，让用户看到登录成功的反馈
      setTimeout(() => {
        router.push('/notes')
      }, 500)
    }
  }, [user, showLoginModal, router])

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              现代化记事本应用
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient">
              优雅记事本
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              现代化、安全、美观的记事本应用，支持密码保护、分享功能
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={handleStartWriting}
              className="text-lg px-8 py-6 h-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              开始写作
            </Button>
            <Link href="/notes">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                <FileText className="h-5 w-5 mr-2" />
                我的笔记
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">功能特性</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            为您提供最佳的记事体验，安全可靠，功能丰富
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="card-hover h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

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

      {/* 登录模态框 */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
      />

      {/* 创建笔记模态框 */}
      <CreateNoteModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSuccess={(noteId) => {
          setShowCreateModal(false)
          // 跳转到笔记编辑页面
          if (noteId) {
            router.push(`/note/${noteId}`)
          }
        }}
      />
    </div>
  )
} 