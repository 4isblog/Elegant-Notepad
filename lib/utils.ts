import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ID generation
export function generateId(): string {
  return nanoid(12)
}

// Short URL generation
export function generateShortUrl(): string {
  return nanoid(8)
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Password verification
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// Content sanitization
export function sanitizeTitle(title: string): string {
  return title.trim().slice(0, 200)
}

export function sanitizeContent(content: string): string {
  // Limit content to 50KB
  const maxLength = 50 * 1024
  return content.slice(0, maxLength)
}

// Date utilities
export function calculateExpiryDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

export function isExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

export function formatDate(dateString: string): string {
  if (!dateString) return '未知时间'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '未知时间'
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatRelativeTime(dateString: string): string {
  if (!dateString) return '未知时间'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '未知时间'
  
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) return '刚刚'
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
  if (diffInHours < 24) return `${diffInHours}小时前`
  if (diffInDays < 7) return `${diffInDays}天前`
  
  return formatDate(dateString)
}

// File download utilities
export function downloadMarkdown(title: string, content: string): void {
  const markdown = `# ${title}\n\n${content}\n\n---\n*由优雅记事本创建*`
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitizeFilename(title)}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^\w\s-]/g, '').trim().slice(0, 50) || 'untitled'
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    return success
  }
}

// URL utilities
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export function getShareUrl(shortUrl: string): string {
  return `${getBaseUrl()}/s/${shortUrl}`
}

// Validation utilities
export function validateTitle(title: string): { isValid: boolean; error?: string } {
  if (!title.trim()) {
    return { isValid: false, error: '标题不能为空' }
  }
  if (title.length > 200) {
    return { isValid: false, error: '标题不能超过200个字符' }
  }
  return { isValid: true }
}

export function validateContent(content: string): { isValid: boolean; error?: string } {
  if (content.length > 50 * 1024) {
    return { isValid: false, error: '内容不能超过50KB' }
  }
  return { isValid: true }
}

export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < 4) {
    return { isValid: false, error: '密码至少需要4个字符' }
  }
  if (password.length > 128) {
    return { isValid: false, error: '密码不能超过128个字符' }
  }
  return { isValid: true }
}

// Theme utilities
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Error handling
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return '发生未知错误'
} 

// Short URL validation utilities
export function validateShortUrl(shortUrl: string): { isValid: boolean; error?: string } {
  if (!shortUrl.trim()) {
    return { isValid: false, error: '短链后缀不能为空' }
  }
  
  // 只允许字母、数字、下划线和连字符
  const validPattern = /^[a-zA-Z0-9_-]+$/
  if (!validPattern.test(shortUrl)) {
    return { isValid: false, error: '短链后缀只能包含字母、数字、下划线和连字符' }
  }
  
  // 长度限制：3-20个字符
  if (shortUrl.length < 3) {
    return { isValid: false, error: '短链后缀至少需要3个字符' }
  }
  if (shortUrl.length > 20) {
    return { isValid: false, error: '短链后缀不能超过20个字符' }
  }
  
  // 不能以连字符开头或结尾
  if (shortUrl.startsWith('-') || shortUrl.endsWith('-')) {
    return { isValid: false, error: '短链后缀不能以连字符开头或结尾' }
  }
  
  // 保留关键词检查
  const reservedWords = ['api', 'admin', 'www', 'app', 'note', 'notes', 'short', 's', 'login', 'register', 'auth']
  if (reservedWords.includes(shortUrl.toLowerCase())) {
    return { isValid: false, error: '该短链后缀为系统保留词，请选择其他后缀' }
  }
  
  return { isValid: true }
}

// Generate short URL with optional custom suffix
export function generateShortUrlWithCustom(customShortUrl?: string): string {
  if (customShortUrl && customShortUrl.trim()) {
    return customShortUrl.trim()
  }
  return generateShortUrl()
} 

// 违禁词列表 - 已迁移到在线API检测，本地列表仅作为备用
const BANNED_WORDS: string[] = [
  // 保留少量测试词汇用于API异常时的本地检测备用
]

// 违禁词检测结果接口
export interface ContentFilterResult {
  isValid: boolean
  bannedWords: string[]
  error?: string
}

// 检测内容是否包含违禁词 - 使用在线API
export async function checkBannedWords(content: string): Promise<ContentFilterResult> {
  if (!content || typeof content !== 'string') {
    return { isValid: true, bannedWords: [] }
  }
  
  // 获取API密钥
  const apiKey = process.env.WEIJIN_API_KEY
  if (!apiKey) {
    //console.warn('未设置违禁词检测API密钥，使用本地检测')
    return checkBannedWordsLocal(content)
  }
  
  try {
    // 调用违禁词检测API（关闭严格模式）
    const response = await fetch(`https://api.yaohud.cn/api/v5/weijin?text=${encodeURIComponent(content)}&key=${apiKey}&yange=no`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // API调用失败，回退到本地检测
      console.warn(`违禁词API调用失败 (状态码: ${response.status})，使用本地检测`)
      return checkBannedWordsLocal(content)
    }

    const result = await response.json()
    
    // 检查API调用是否成功
    if (result.code !== 200 || !result.data) {
      console.warn('违禁词API返回错误，使用本地检测:', result.msg || '未知错误')
      return checkBannedWordsLocal(content)
    }
    
    // 解析实际的检测结果
    const data = result.data
    if (data.containsBannedWord === true) {
      // 确保 words 是数组，并正确处理
      let bannedWords: string[] = []
      let wordsStr = '未知违禁词'
      
      if (data.words) {
        if (Array.isArray(data.words)) {
          bannedWords = []
          for (const word of data.words) {
            if (typeof word === 'string') {
              bannedWords.push(word)
            } else if (typeof word === 'object' && word !== null) {
              // 处理数组中的对象元素
              if (word.word) {
                bannedWords.push(String(word.word))
              } else if (word.text) {
                bannedWords.push(String(word.text))
              } else if (word.content) {
                bannedWords.push(String(word.content))
              } else if (word.value) {
                bannedWords.push(String(word.value))
              } else {
                // 尝试提取对象中的有效字符串值
                const values = Object.values(word).filter(v => 
                  v && typeof v === 'string' && v.trim().length > 0
                )
                if (values.length > 0) {
                  bannedWords.push(...values.map(v => String(v)))
                } else {
                  bannedWords.push('敏感词汇')
                }
              }
            } else {
              bannedWords.push(String(word))
            }
          }
          wordsStr = bannedWords.join(', ')
        } else if (typeof data.words === 'object' && data.words !== null) {
          // 如果是对象，尝试提取有用信息
          try {
            const wordObj = data.words
            
            // 尝试多种可能的字段名
            if (wordObj.word) {
              bannedWords = [String(wordObj.word)]
              wordsStr = String(wordObj.word)
            } else if (wordObj.text) {
              bannedWords = [String(wordObj.text)]
              wordsStr = String(wordObj.text)
            } else if (wordObj.content) {
              bannedWords = [String(wordObj.content)]
              wordsStr = String(wordObj.content)
            } else if (wordObj.value) {
              bannedWords = [String(wordObj.value)]
              wordsStr = String(wordObj.value)
            } else {
              // 如果是对象但没有预期字段，查看对象的所有值
              const values = Object.values(wordObj).filter(v => 
                v && typeof v === 'string' && v.trim().length > 0
              )
              
              if (values.length > 0) {
                bannedWords = values.map(v => String(v))
                wordsStr = values.join(', ')
              } else {
                bannedWords = ['检测到敏感内容']
                wordsStr = '检测到敏感内容'
              }
            }
          } catch (e) {
            console.warn('解析违禁词对象时出错:', e)
            bannedWords = ['检测到敏感内容']
            wordsStr = '检测到敏感内容'
          }
        } else {
          // 如果不是数组也不是对象，直接转换为字符串
          bannedWords = [String(data.words)]
          wordsStr = String(data.words)
        }
      }
      

      
      return {
        isValid: false,
        bannedWords: bannedWords,
        error: `内容包含违禁词：${wordsStr}`
      }
    }
    
    return { isValid: true, bannedWords: [] }
  } catch (error) {
    // 网络错误或其他异常，回退到本地检测
    console.warn('违禁词检测API异常，使用本地检测:', error)
    return checkBannedWordsLocal(content)
  }
}

// 本地违禁词检测（作为备用方案）
function checkBannedWordsLocal(content: string): ContentFilterResult {
  if (!content || typeof content !== 'string') {
    return { isValid: true, bannedWords: [] }
  }
  
  const foundBannedWords: string[] = []
  const lowerContent = content.toLowerCase()
  
  // 检查每个违禁词
  for (const word of BANNED_WORDS) {
    if (lowerContent.includes(word.toLowerCase())) {
      foundBannedWords.push(word)
    }
  }
  
  if (foundBannedWords.length > 0) {
    return {
      isValid: false,
      bannedWords: foundBannedWords,
      error: `内容包含违禁词：${foundBannedWords.join(', ')}`
    }
  }
  
  return { isValid: true, bannedWords: [] }
}

// 检测笔记内容的违禁词（不检测标题）
export async function validateContentFilter(title: string, content: string): Promise<ContentFilterResult> {
  // 只检查内容，不检查标题
  const contentCheck = await checkBannedWords(content)
  if (!contentCheck.isValid) {
    return {
      isValid: false,
      bannedWords: contentCheck.bannedWords,
      error: contentCheck.error // 直接使用错误信息，不添加"内容"前缀
    }
  }
  
  return { isValid: true, bannedWords: [] }
}

// 获取违禁词数量（用于管理界面）
export function getBannedWordsCount(): number {
  return BANNED_WORDS.length
}

// 敏感词替换（可选功能，将违禁词替换为***）
export function replaceBannedWords(content: string, replacement: string = '***'): string {
  if (!content || typeof content !== 'string') {
    return content
  }
  
  let filteredContent = content
  
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    filteredContent = filteredContent.replace(regex, replacement)
  }
  
  return filteredContent
} 

 