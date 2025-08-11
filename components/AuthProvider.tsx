"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContextType, User } from '@/types'
import toast from 'react-hot-toast'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 检查用户登录状态
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (username: string, password: string, captchaToken?: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, captchaToken }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        return true
      } else {
        throw new Error(data.error || '登录失败')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (username: string, password: string, email: string, emailCode: string, captchaToken?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email, emailCode, captchaToken }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        return true
      } else {
        throw new Error(data.error || '注册失败')
      }
    } catch (error: any) {
      console.error('Register error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      router.push('/')
      toast.success('已退出登录')
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 