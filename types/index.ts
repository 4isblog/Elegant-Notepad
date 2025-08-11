export interface Note {
  id: string
  title: string
  content: string
  isPasswordProtected: boolean
  passwordHash?: string
  createdAt: string
  updatedAt: string
  shortUrl?: string
  userId?: string  // 添加用户ID字段
}

export interface CreateNoteRequest {
  title: string
  content: string
  password?: string
  customShortUrl?: string  // 新增：自定义短链后缀
}

export interface UpdateNoteRequest {
  title?: string
  content?: string
  password?: string
}

export interface NoteAccess {
  noteId: string
  hasAccess: boolean
  isPasswordProtected: boolean
}

export interface ShareableNote {
  id: string
  title: string
  content: string
  shortUrl: string
  createdAt: string
  updatedAt: string  // 添加更新时间字段
  isPasswordProtected: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface RedisConfig {
  url: string
  token: string
}

export type Theme = 'light' | 'dark' | 'system'

export interface ToastOptions {
  type: 'success' | 'error' | 'loading' | 'info'
  title: string
  description?: string
}

// 新增用户认证相关类型
export interface User {
  id: string
  username: string
  email: string
  passwordHash: string
  createdAt: string
  updatedAt: string
  noContentAudit?: boolean  // 免审核权限标识
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: {
    id: string
    username: string
    email: string
    createdAt: string
    updatedAt: string
    noContentAudit?: boolean
  }
  token?: string
  error?: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string, captchaToken?: string) => Promise<boolean>
  register: (username: string, password: string, email: string, emailCode: string, captchaToken?: string) => Promise<boolean>
  logout: () => Promise<void>
}