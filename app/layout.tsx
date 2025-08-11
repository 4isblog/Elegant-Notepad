import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/components/AuthProvider'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: '优雅记事本 - 现代化、安全、美观的记事本应用',
  description: '现代化、安全、美观的记事本应用，支持密码保护、分享功能。基于 Next.js 14 构建，部署在 Vercel 上，使用 Upstash Redis 存储。',
  keywords: ['记事本', '笔记', '密码保护', '分享', 'Next.js', 'React'],
  authors: [{ name: '优雅记事本团队' }],
  openGraph: {
    title: '优雅记事本',
    description: '现代化、安全、美观的记事本应用',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: '优雅记事本',
    description: '现代化、安全、美观的记事本应用',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
              {children}
            </div>
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={8}
              containerClassName=""
              containerStyle={{
                top: 20,
                left: 20,
                right: 20,
              }}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '16px 20px',
                  maxWidth: '420px',
                  backdropFilter: 'blur(16px)',
                  transition: 'all 0.3s ease',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: 'rgba(34, 197, 94, 0.08)',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderLeft: '4px solid #22c55e',
                    backdropFilter: 'blur(16px)',
                  },
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: 'rgba(255, 255, 255, 0.9)',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderLeft: '4px solid #ef4444',
                    backdropFilter: 'blur(16px)',
                  },
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: 'rgba(255, 255, 255, 0.9)',
                  },
                },
                loading: {
                  style: {
                    background: 'rgba(59, 130, 246, 0.08)',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderLeft: '4px solid #3b82f6',
                    backdropFilter: 'blur(16px)',
                  },
                  iconTheme: {
                    primary: '#3b82f6',
                    secondary: 'rgba(255, 255, 255, 0.9)',
                  },
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 