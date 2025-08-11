"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Shield, 
  FileText, 
  Users, 
  AlertTriangle, 
  ArrowLeft,
  Clock,
  Scale,
  Ban,
  UserX,
  Gavel
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"

const sections = [
  {
    id: "acceptance",
    icon: FileText,
    title: "条款接受",
    content: [
      "欢迎使用优雅记事本！",
      "通过访问和使用我们的服务，您同意受本服务条款的约束。如果您不同意这些条款，请不要使用我们的服务。",
      "",
      "我们保留随时修改这些条款的权利。重大变更将提前通知用户。继续使用服务即表示您接受修改后的条款。"
    ]
  },
  {
    id: "service-description",
    icon: FileText,
    title: "服务描述",
    content: [
      "优雅记事本是一个在线笔记管理平台，提供以下功能：",
      "• 创建、编辑和管理个人笔记",
      "• 笔记的密码保护功能",
      "• 通过短链接分享笔记",
      "• Markdown 格式支持",
      "• 云端存储和同步",
      "",
      "我们致力于提供稳定、安全的服务，但不保证服务的不间断运行。"
    ]
  },
  {
    id: "user-accounts",
    icon: Users,
    title: "用户账户",
    content: [
      "用户账户注册和管理规则：",
      "• 您必须提供准确、完整的注册信息",
      "• 您有责任保护账户密码的安全",
      "• 一个IP地址只能注册一个账户",
      "• 禁止创建虚假账户或冒充他人",
      "• 您对账户下的所有活动负责",
      "",
      "如发现账户被盗用，请立即联系我们。"
    ]
  },
  {
    id: "acceptable-use",
    icon: Shield,
    title: "可接受使用",
    content: [
      "使用我们的服务时，您同意不会：",
      "• 上传违法、有害、威胁性或诽谤性内容",
      "• 侵犯他人的知识产权或隐私权",
      "• 传播垃圾信息、病毒或恶意代码",
      "• 尝试未经授权访问系统或其他用户数据",
      "• 进行任何可能损害服务稳定性的行为",
      "• 将服务用于商业目的（除非获得许可）",
      "",
      "违反这些规则可能导致账户被暂停或终止。"
    ]
  },
  {
    id: "content-ownership",
    icon: FileText,
    title: "内容所有权",
    content: [
      "关于您创建的内容：",
      "• 您保留对自己创建的笔记内容的所有权",
      "• 您授权我们存储、处理和传输您的内容以提供服务",
      "• 您有责任确保内容不侵犯他人权利",
      "• 我们不会主动审查或监控用户内容",
      "• 您可以随时删除自己的内容",
      "",
      "关于我们的平台：",
      "• 我们拥有平台软件和服务的所有权",
      "• 用户不得复制、修改或分发我们的软件"
    ]
  },
  {
    id: "privacy",
    icon: Shield,
    title: "隐私保护",
    content: [
      "我们非常重视您的隐私：",
      "• 详细的隐私保护措施请参阅我们的隐私策略",
      "• 我们采用行业标准的安全措施保护数据",
      "• 不会在未经授权的情况下访问您的私人笔记",
      "• 仅在必要时收集和使用个人信息",
      "",
      "隐私策略是本服务条款的重要组成部分。"
    ]
  },
  {
    id: "service-availability",
    icon: Clock,
    title: "服务可用性",
    content: [
      "关于服务的可用性：",
      "• 我们努力提供稳定的服务，但不保证100%在线时间",
      "• 可能因维护、升级或技术问题暂停服务",
      "• 重大维护会提前通知用户",
      "• 我们不对服务中断造成的损失承担责任",
      "",
      "建议用户定期备份重要数据。"
    ]
  },
  {
    id: "termination",
    icon: UserX,
    title: "服务终止",
    content: [
      "账户终止的情况：",
      "• 您可以随时删除自己的账户",
      "• 我们可能因违反条款而终止用户账户",
      "• 长期不活跃的账户可能被删除",
      "• 账户终止后，相关数据将被删除",
      "",
      "账户终止流程：",
      "• 提前30天通知（除非违反条款）",
      "• 用户可以在此期间导出数据",
      "• 终止后数据将无法恢复"
    ]
  },
  {
    id: "limitation-liability",
    icon: Scale,
    title: "责任限制",
    content: [
      "我们的责任限制：",
      "• 服务按\"现状\"提供，不提供任何明示或暗示的保证",
      "• 不对数据丢失、业务中断等间接损失承担责任",
      "• 对直接损失的赔偿责任不超过用户支付的费用",
      "• 不对第三方内容或链接承担责任",
      "",
      "用户责任：",
      "• 用户对自己的内容和行为完全负责",
      "• 应遵守适用的法律法规",
      "• 对违反条款造成的后果承担责任"
    ]
  },
  {
    id: "changes",
    icon: FileText,
    title: "条款变更",
    content: [
      "服务条款的修改：",
      "• 我们可能根据法律变化或业务需要修改条款",
      "• 重大变更将提前30天通知用户",
      "• 通知方式包括邮件、网站公告等",
      "• 用户可以选择接受变更或停止使用服务",
      "",
      "建议用户定期查看服务条款以了解最新变化。",
      "",
      "最后更新时间：2025年1月"
    ]
  },
  {
    id: "contact",
    icon: Gavel,
    title: "争议解决",
    content: [
      "如果您对我们的服务有任何争议：",
      "",
      "第一步：友好协商",
      "• 首先通过邮件与我们联系：service@4is.cc",
      "• 我们将在7个工作日内回复",
      "• 大多数问题可以通过协商解决",
      "",
      "法律适用：",
      "• 本条款受中华人民共和国法律管辖",
      "• 争议应通过协商、调解或仲裁解决",
      "• 如需诉讼，由我们所在地人民法院管辖"
    ]
  }
]

export default function TermsPage() {
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
              <Scale className="h-4 w-4" />
              服务条款
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient">
              服务条款
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              本服务条款规定了您使用优雅记事本服务的权利、义务和责任
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
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    重要说明
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    请仔细阅读本服务条款。通过使用优雅记事本服务，您同意受本条款的约束。
                    本条款与隐私策略共同构成我们与您之间的完整协议。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Terms Sections */}
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
                如果您对本服务条款有任何疑问，请随时与我们联系
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <Scale className="h-5 w-5" />
                <span>我们承诺在24小时内回复您的法律相关咨询</span>
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
              <Button
                variant="link"
                size="sm"
                onClick={() => window.location.href = '/privacy'}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
              >
                隐私策略
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={() => window.location.href = '/terms'}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
              >
                服务条款
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={() => window.location.href = '/about'}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
              >
                关于我们
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 