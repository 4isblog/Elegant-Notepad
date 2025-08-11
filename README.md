# 🖋️ 优雅记事本 - Elegant Notepad

一款现代化、安全、美观的在线记事本应用，提供丰富的功能和优雅的用户体验。基于 Next.js 14 构建，集成用户认证、密码保护、分享功能、管理后台等完整解决方案。

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

## 📸 应用截图

### 🏠 主页界面
![主页界面](images/1.png)

### 📝 创建笔记
![创建笔记](images/2.png)

### 📋 笔记列表
![笔记列表](images/3.png)

### 👀 笔记详情
![笔记详情](images/4.png)

### 🔗 分享页面
![分享页面](images/5.png)

## ✨ 核心功能

### 🔐 用户认证系统
- **安全注册登录** - JWT 令牌认证，bcrypt 密码加密
- **邮箱验证** - 完整的邮箱验证码机制
- **密码重置** - 支持通过邮箱重置密码
- **账户注销** - 安全的账户注销功能
- **验证码保护** - 图形验证码防止恶意注册

### 📝 智能笔记管理
- **富文本编辑** - 支持 Markdown 语法的现代编辑器
- **实时保存** - 自动保存编辑内容，防止数据丢失
- **密码保护** - 为敏感笔记设置独立密码保护
- **批量管理** - 支持批量选择、删除笔记
- **搜索功能** - 快速搜索和筛选笔记内容

### 🔗 分享与协作
- **短链接生成** - 自动生成可分享的短链接
- **自定义链接** - 支持自定义短链接后缀
- **访问权限控制** - 可设置密码保护的分享
- **Markdown 导出** - 一键下载 .md 格式文件
- **访问统计** - 追踪分享链接的访问情况

### 🛡️ 高级安全功能
- **内容审核** - 智能违禁词检测和内容过滤
- **权限管理** - 细粒度的用户权限控制
- **数据加密** - 敏感数据全程加密存储
- **XSS 防护** - 完善的跨站脚本攻击防护
- **输入验证** - 严格的输入参数验证和净化

### 🎨 现代化界面
- **响应式设计** - 完美适配桌面端、平板、手机
- **深色主题** - 支持深色/浅色主题切换
- **动画效果** - 流畅的页面过渡和交互动画
- **无障碍访问** - 遵循 WCAG 无障碍访问标准
- **PWA 支持** - 渐进式 Web 应用体验

### 👑 管理后台
- **用户管理** - 完整的用户搜索和管理功能
- **权限控制** - 管理员权限分配和审核豁免
- **系统监控** - Redis 状态监控和调试工具
- **数据统计** - 用户活跃度和内容统计分析

### 🎯 智能功能
- **一言集成** - 每日励志语句，提升用户体验
- **健康检查** - 完整的系统健康状态监控
- **调试工具** - 开发环境下的调试和测试工具

## 🚀 快速开始

### 环境要求

- **Node.js** 18.0+ 
- **Upstash Redis** 数据库
- **SMTP 邮件服务** (可选，用于邮箱验证)
- **一言API** (可选，用于励志语句)

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/4isblog/Elegant-Notepad)

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/4isblog/Elegant-Notepad
   cd Elegant-Notepad
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp env.example .env.local
   # 编辑 .env.local 填入必要配置
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   ```
   http://localhost:3000
   ```

## 🔧 环境配置

创建 `.env.local` 文件并配置以下变量：

```env
# Redis 数据库配置 (必需)
KV_URL=rediss://default:your_token@your-redis.upstash.io:6379
KV_REST_API_URL=https://your-redis.upstash.io
KV_REST_API_TOKEN=your_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_read_only_token
REDIS_URL=rediss://default:your_token@your-redis.upstash.io:6379

# 应用配置 (必需)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
JWT_SECRET=your-very-secure-jwt-secret

# 邮件服务配置 (可选)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# 一言API配置 (可选)
YIYAN_API_KEY=your-yiyan-api-key

# 管理员配置 (可选)
ADMIN_USERS=admin1,admin2
```

### Redis 数据库设置

1. 访问 [Upstash Console](https://console.upstash.com/)
2. 创建新的 Redis 数据库
3. 选择合适的地区 (建议选择离目标用户最近的地区)
4. 复制数据库连接信息到环境变量
5. 配置 REST API 访问权限

### 邮件服务设置

支持任何标准 SMTP 服务：

- **Gmail**: 使用应用专用密码
- **Outlook**: 配置 SMTP 设置
- **SendGrid**: 使用 API 密钥
- **自建邮件服务器**: 配置相应参数

## 🏗️ 项目架构

```
elegant-notepad/
├── 📁 app/                     # Next.js 14 App Router
│   ├── 📁 api/                # API 路由
│   │   ├── 📁 auth/           # 用户认证相关
│   │   │   ├── login/         # 用户登录
│   │   │   ├── register/      # 用户注册
│   │   │   ├── verify-email/  # 邮箱验证
│   │   │   ├── reset-password/# 密码重置
│   │   │   └── ...
│   │   ├── 📁 notes/          # 笔记管理
│   │   │   ├── [id]/          # 单个笔记操作
│   │   │   └── route.ts       # 笔记列表
│   │   ├── 📁 admin/          # 管理员功能
│   │   ├── 📁 short/          # 短链接处理
│   │   ├── 📁 yiyan/          # 一言API
│   │   └── 📁 debug/          # 调试工具
│   ├── 📁 admin/              # 管理后台页面
│   ├── 📁 note/[id]/          # 笔记详情页
│   ├── 📁 notes/              # 笔记列表页
│   ├── 📁 s/[shortUrl]/       # 分享页面
│   └── ...
├── 📁 components/             # React 组件
│   ├── 📁 ui/                 # 基础 UI 组件
│   │   ├── button.tsx         # 按钮组件
│   │   ├── card.tsx          # 卡片组件
│   │   ├── dialog.tsx        # 对话框组件
│   │   ├── markdown-editor.tsx# Markdown 编辑器
│   │   └── ...
│   ├── AuthProvider.tsx       # 认证上下文
│   ├── CreateNoteModal.tsx    # 创建笔记模态框
│   ├── AdminPanel.tsx         # 管理面板
│   ├── EmailVerification.tsx  # 邮箱验证组件
│   └── ...
├── 📁 lib/                    # 工具库
│   ├── auth.ts               # 认证工具
│   ├── redis.ts              # Redis 客户端
│   ├── email.ts              # 邮件服务
│   └── utils.ts              # 通用工具
├── 📁 types/                  # TypeScript 类型定义
└── 📁 images/                 # 应用截图
```

## 🔌 API 接口文档

### 认证接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/logout` | POST | 用户登出 |
| `/api/auth/me` | GET | 获取当前用户信息 |
| `/api/auth/verify-email` | POST | 邮箱验证 |
| `/api/auth/send-verification` | POST | 发送验证码 |
| `/api/auth/reset-password` | POST | 重置密码 |
| `/api/auth/deactivate` | DELETE | 注销账户 |

### 笔记管理

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/notes` | GET | 获取用户笔记列表 |
| `/api/notes` | POST | 创建新笔记 |
| `/api/notes/[id]` | GET | 获取特定笔记 |
| `/api/notes/[id]` | PUT | 更新笔记内容 |
| `/api/notes/[id]` | DELETE | 删除笔记 |
| `/api/notes/[id]/password` | PUT | 设置笔记密码 |
| `/api/notes/[id]/password` | DELETE | 移除笔记密码 |
| `/api/notes/[id]/verify` | POST | 验证笔记密码 |

### 分享功能

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/short/[shortUrl]` | GET | 通过短链接访问笔记 |

### 管理员接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/admin/user-audit` | GET | 搜索用户信息 |
| `/api/admin/user-audit` | POST | 更新用户权限 |

### 系统接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 系统健康检查 |
| `/api/yiyan` | GET | 获取励志语句 |

## 🎨 技术栈

### 前端技术
- **Next.js 14** - React 全栈框架，App Router
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Framer Motion** - 动画和手势库
- **Lucide React** - 现代图标库
- **React Hook Form** - 表单状态管理
- **React Hot Toast** - 优雅的消息提示

### 后端技术
- **Next.js API Routes** - 无服务器 API
- **Upstash Redis** - 无服务器 Redis 数据库
- **bcryptjs** - 密码加密
- **jsonwebtoken** - JWT 令牌认证
- **Nodemailer** - 邮件发送服务

### 开发工具
- **ESLint** - 代码质量检查
- **TypeScript** - 静态类型检查
- **PostCSS** - CSS 后处理器
- **Autoprefixer** - CSS 自动前缀

### 部署平台
- **Vercel** - 前端托管和无服务器函数
- **Upstash** - Redis 数据库托管
- **GitHub** - 代码版本控制

## 🛡️ 安全特性

### 数据保护
- **密码加密**: 使用 bcrypt 进行密码哈希
- **数据加密**: 敏感数据存储前加密
- **输入验证**: 严格的输入参数验证和净化
- **XSS 防护**: 跨站脚本攻击防护头
- **CSRF 保护**: 跨站请求伪造防护

### 访问控制
- **JWT 认证**: 无状态的用户认证
- **权限分级**: 管理员和普通用户权限分离
- **会话管理**: 安全的会话令牌管理
- **账户保护**: 登录失败次数限制

### 内容安全
- **违禁词过滤**: 智能内容审核系统
- **文件上传限制**: 安全的文件类型和大小限制
- **内容加密**: 密码保护笔记的端到端加密

## 📱 使用指南

### 创建笔记
1. 点击 "开始写作" 或 "新建笔记"
2. 输入笔记标题
3. 可选设置密码保护和自定义短链接
4. 使用 Markdown 编辑器编写内容
5. 自动保存，或手动保存

### 分享笔记
1. 在笔记详情页点击分享按钮
2. 复制生成的短链接
3. 分享给其他人访问
4. 可设置密码保护分享

### 下载备份
1. 在笔记列表或详情页
2. 点击下载按钮
3. 获得 Markdown 格式文件
4. 可用于本地备份或迁移

### 密码保护
1. 创建或编辑笔记时设置密码
2. 只有知道密码的人才能查看内容
3. 支持修改或移除密码
4. 密码独立于用户账户

## 🔧 高级配置

### 管理员设置
管理员可以通过环境变量 `ADMIN_USERS` 配置，支持：
- 用户权限管理
- 内容审核豁免
- 系统监控访问
- 调试工具使用

### 内容审核
内置违禁词检测系统，支持：
- 自定义违禁词列表
- 智能内容分析
- 用户举报机制
- 管理员审核流程

### 缓存策略
合理的缓存配置提升性能：
- Redis 数据缓存
- 静态资源缓存
- API 响应缓存
- 客户端缓存

## 📊 性能优化

### 前端优化
- **代码分割**: 按需加载组件和页面
- **图片优化**: Next.js 图片组件优化
- **字体优化**: 字体文件预加载和优化
- **CSS 优化**: 关键 CSS 内联和延迟加载

### 后端优化
- **数据库查询**: 优化 Redis 查询模式
- **API 缓存**: 合理的 API 响应缓存
- **无服务器优化**: 冷启动时间优化
- **内存管理**: 有效的内存使用模式

### 网络优化
- **CDN 分发**: 静态资源 CDN 加速
- **Gzip 压缩**: 响应内容压缩
- **HTTP/2**: 现代 HTTP 协议支持
- **预加载**: 关键资源预加载

## 🤝 贡献指南

我们欢迎社区贡献！请按照以下步骤：

### 开发流程
1. Fork 项目到你的 GitHub
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

### 代码规范
- 遵循 ESLint 配置
- 使用 TypeScript 严格模式
- 编写清晰的提交信息
- 添加必要的测试用例
- 更新相关文档

### 问题报告
使用 GitHub Issues 报告问题，请包含：
- 详细的问题描述
- 复现步骤
- 期望行为
- 实际行为
- 环境信息

## 📄 开源许可

本项目基于 [MIT License](LICENSE) 开源许可协议。

## 🙏 致谢

### 开源项目
感谢以下优秀的开源项目：
- [Next.js](https://nextjs.org/) - React 全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Framer Motion](https://www.framer.com/motion/) - 动画库
- [Upstash](https://upstash.com/) - 无服务器 Redis

### 社区支持
- 感谢所有贡献者的代码贡献
- 感谢用户的反馈和建议
- 感谢开源社区的支持和启发

## 📞 联系我们

- **GitHub Issues**: [项目问题追踪](https://github.com/your-username/elegant-notepad/issues)
- **讨论区**: [GitHub Discussions](https://github.com/your-username/elegant-notepad/discussions)
- **邮箱**: your-email@example.com

---

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！**

Made with ❤️ by the Elegant Notepad Team
