"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Shield, 
  Lock, 
  Eye, 
  Server, 
  UserCheck, 
  AlertTriangle,
  ArrowLeft,
  Clock,
  Globe,
  FileText
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/Header"

const sections = [
  {
    id: "collection",
    icon: UserCheck,
    title: "信息收集",
    content: [
      "我们仅收集为您提供服务所必需的信息：",
      "• 注册信息：用户名、邮箱地址（用于账户创建和身份验证）",
      "• 笔记内容：您创建的笔记文本内容（存储在加密数据库中）",
      "• 使用数据：访问日志、IP地址（仅用于安全分析和服务优化）",
      "• 设备信息：浏览器类型、操作系统（用于兼容性优化）",
      "",
      "我们不会收集您的个人敏感信息，如身份证号、银行账户等。"
    ]
  },
  {
    id: "usage",
    icon: Eye,
    title: "信息使用",
    content: [
      "我们使用收集的信息来：",
      "• 提供和维护记事本服务",
      "• 验证用户身份，保护账户安全",
      "• 改进产品功能和用户体验",
      "• 发送重要的服务通知（如安全提醒）",
      "• 分析使用趋势，优化服务性能",
      "",
      "我们承诺不会将您的个人信息用于营销目的或出售给第三方。"
    ]
  },
  {
    id: "storage",
    icon: Server,
    title: "数据存储",
    content: [
      "您的数据安全是我们的首要任务：",
      "• 所有笔记内容都经过端到端加密存储",
      "• 使用行业标准的 AES-256 加密算法",
      "• 数据存储在安全的云服务器上，具有多重备份",
      "• 服务器位于安全的数据中心，24/7 监控",
      "• 定期进行安全审计和漏洞扫描",
      "",
      "即使是我们的技术人员也无法直接读取您的笔记内容。"
    ]
  },
  {
    id: "sharing",
    icon: Globe,
    title: "信息分享",
    content: [
      "我们严格限制信息分享：",
      "• 不会出售、交换或租赁您的个人信息",
      "• 仅在以下情况下可能分享信息：",
      "  - 获得您的明确同意",
      "  - 法律法规要求",
      "  - 保护我们的合法权益",
      "  - 防止欺诈或安全威胁",
      "• 与第三方服务提供商合作时，确保他们遵守同等的隐私保护标准",
      "",
      "任何信息分享都会在法律允许的范围内进行。"
    ]
  },
  {
    id: "protection",
    icon: Lock,
    title: "数据保护",
    content: [
      "我们采用多层安全措施保护您的数据：",
      "• 传输加密：所有数据传输都使用 HTTPS/TLS 加密",
      "• 存储加密：数据库中的敏感信息都经过加密存储",
      "• 访问控制：严格的权限管理，最小化数据访问",
      "• 安全监控：实时监控异常访问和潜在威胁",
      "• 定期备份：确保数据的完整性和可恢复性",
      "• 员工培训：所有员工都接受数据保护培训",
      "",
      "我们会定期更新安全措施以应对新的威胁。"
    ]
  },
  {
    id: "rights",
    icon: UserCheck,
    title: "用户权利",
    content: [
      "您对自己的数据拥有完全的控制权：",
      "• 访问权：随时查看我们收集的关于您的信息",
      "• 修改权：更新或修正您的个人信息",
      "• 删除权：请求删除您的账户和所有相关数据",
      "• 导出权：以标准格式导出您的笔记数据",
      "• 撤回同意：随时撤回对数据处理的同意",
      "• 投诉权：向数据保护机构投诉",
      "",
      "如需行使这些权利，请通过邮件联系我们。"
    ]
  },
  {
    id: "cookies",
    icon: FileText,
    title: "Cookie 使用",
    content: [
      "我们使用 Cookie 来改善您的使用体验：",
      "• 必要 Cookie：确保网站正常运行（如登录状态）",
      "• 偏好 Cookie：记住您的设置（如主题偏好）",
      "• 分析 Cookie：了解网站使用情况（匿名数据）",
      "",
      "您可以通过浏览器设置管理 Cookie：",
      "• 禁用所有 Cookie（可能影响网站功能）",
      "• 禁用第三方 Cookie",
      "• 在接受 Cookie 前收到通知",
      "",
      "我们不使用 Cookie 进行跨站跟踪或广告定向。"
    ]
  },
  {
    id: "updates",
    icon: Clock,
    title: "策略更新",
    content: [
      "隐私策略可能会不定期更新：",
      "• 重大变更会提前30天通知用户",
      "• 通知方式包括邮件和网站公告",
      "• 继续使用服务视为接受新策略",
      "• 您可以随时查看最新版本的隐私策略",
      "",
      "建议您定期查看隐私策略以了解最新变化。",
      "",
      "最后更新时间：2025年1月"
    ]
  }
]

export default function PrivacyPage() {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Shield className="h-4 w-4" />
              隐私保护承诺
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient">
              隐私策略
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              我们深知隐私保护的重要性，本策略详细说明我们如何收集、使用和保护您的个人信息
            </p>
          </motion.div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    重要提醒
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    请仔细阅读本隐私策略。通过使用优雅记事本服务，您同意我们按照本策略处理您的个人信息。
                    如果您不同意本策略的任何内容，请不要使用我们的服务。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Privacy Sections */}
      <section className="container mx-auto px-4 py-16">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              id={section.id}
            >
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    {section.content.map((paragraph, pIndex) => (
                      <p key={pIndex} className={paragraph === "" ? "mb-2" : "mb-4 text-muted-foreground leading-relaxed"}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="card-hover">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">有疑问？联系我们</CardTitle>
              <CardDescription className="text-base">
                如果您对本隐私策略有任何疑问或担忧，请随时与我们联系
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <Shield className="h-5 w-5" />
                <span>我们承诺在24小时内回复您的隐私相关咨询</span>
              </div>
              <p className="text-muted-foreground">
                邮箱：service@4is.cc
              </p>
            </CardContent>
          </Card>
        </motion.div>
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