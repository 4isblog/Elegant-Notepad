"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  FileText, 
  Heart, 
  Users, 
  Target, 
  Shield, 
  Zap,
  Mail,
  ArrowLeft,
  Code,
  Globe,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/Header"

const values = [
  {
    icon: Shield,
    title: "安全第一",
    description: "我们将用户数据安全视为最高优先级，采用最新的加密技术保护您的隐私",
    gradient: "from-red-500 to-pink-500"
  },
  {
    icon: Heart,
    title: "用户体验",
    description: "致力于创造直观、优雅的用户界面，让记事变得简单而愉悦",
    gradient: "from-purple-500 to-indigo-500"
  },
  {
    icon: Zap,
    title: "持续创新",
    description: "不断探索新技术，为用户提供更快速、更可靠的服务体验",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    icon: Globe,
    title: "开放透明",
    description: "坚持开源理念，代码公开透明，接受社区监督和贡献",
    gradient: "from-green-500 to-emerald-500"
  }
]

const features = [
  "现代化的 React/Next.js 技术栈",
  "安全的密码保护功能",
  "便捷的短链接分享",
  "优雅的 Markdown 编辑器",
  "响应式设计，支持所有设备",
  "高性能的云端存储",
  "直观的用户界面设计",
  "持续的功能更新和优化"
]

export default function AboutPage() {
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
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient">
              关于我们
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              我们是一个专注于打造优质记事工具的团队，致力于为用户提供安全、优雅、高效的记事体验
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Target className="h-4 w-4" />
                我们的使命
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                让记事变得简单而安全
              </h2>
              <p className="text-lg text-muted-foreground">
                在信息爆炸的时代，我们相信每个人都需要一个可靠的地方来记录想法、整理思绪。
                优雅记事本诞生于对现有记事工具的不满，我们希望创造一个既美观又安全，
                既简单又强大的记事平台。
              </p>
              <p className="text-lg text-muted-foreground">
                无论是灵感闪现的瞬间，还是重要会议的记录，无论是日常的待办事项，
                还是私密的个人感悟，我们都希望为您提供最贴心的记事体验。
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  技术驱动
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  基于最新的 Web 技术栈构建，确保应用的性能、安全性和用户体验都达到业界领先水平。
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  社区驱动
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  我们重视每一位用户的反馈，积极听取社区意见，不断优化产品功能和用户体验。
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">核心价值观</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            这些价值观指导着我们的每一个决策，确保我们始终朝着正确的方向前进
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="card-hover h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${value.gradient} flex items-center justify-center mb-4`}>
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">
                我们提供什么
              </h2>
              <p className="text-lg text-muted-foreground">
                优雅记事本不仅仅是一个记事工具，更是您思想的数字化延伸，
                帮助您更好地整理思路、管理信息、分享想法。
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>联系我们</CardTitle>
                <CardDescription>
                  如果您有任何问题、建议或合作意向，欢迎随时与我们联系
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">service@4is.cc</span>
                </div>
                <Button className="w-full">
                  发送邮件
                </Button>
              </CardContent>
            </Card>
          </motion.div>
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
    </div>
  )
} 