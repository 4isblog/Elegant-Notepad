import { Redis } from '@upstash/redis'
import { Note } from '@/types'

// Redis client instance
let redisInstance: Redis | null = null

// Development mode in-memory storage
let devStorage: Map<string, any> = new Map()
let devNotesIndex: Set<string> = new Set()

const isDevelopment = process.env.NODE_ENV === 'development'

export function getRedisInstance(): Redis {
  if (!redisInstance) {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      if (isDevelopment) {
        console.log('🔧 Development mode: Using in-memory storage instead of Redis')
        // Return a mock Redis instance for development
        return {
          set: async (key: string, value: any) => {
            devStorage.set(key, typeof value === 'string' ? value : JSON.stringify(value))
            return 'OK'
          },
          get: async (key: string) => {
            return devStorage.get(key) || null
          },
          del: async (key: string) => {
            devStorage.delete(key)
            return 1
          },
          sadd: async (key: string, ...members: string[]) => {
            if (key === 'notes:index') {
              members.forEach(member => devNotesIndex.add(member))
            }
            return members.length
          },
          srem: async (key: string, ...members: string[]) => {
            if (key === 'notes:index') {
              members.forEach(member => devNotesIndex.delete(member))
            }
            return members.length
          },
          smembers: async (key: string) => {
            if (key === 'notes:index') {
              return Array.from(devNotesIndex)
            }
            return []
          },
          exists: async (key: string) => {
            return devStorage.has(key) ? 1 : 0
          },
          mget: async (...keys: string[]) => {
            return keys.map(key => devStorage.get(key) || null)
          },
          ping: async () => 'PONG',
          expireat: async (key: string, timestamp: number) => {
            // In development, we'll ignore expiration for simplicity
            return 1
          }
        } as any
      }
      throw new Error('缺少必需的 Upstash Redis 环境变量')
    }

    redisInstance = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  }
  return redisInstance
}

// Helper functions for note operations
export async function saveNote(note: Note): Promise<void> {
  const redis = getRedisInstance()
  
  try {
    // Save the note data
    const noteKey = `note:${note.id}`
    await redis.set(noteKey, JSON.stringify(note))
    

    
    // Save short URL mapping if exists
    if (note.shortUrl) {
      const shortKey = `short:${note.shortUrl}`
      await redis.set(shortKey, note.id)
      

    }
    
    // Add to notes index
    await redis.sadd('notes:index', note.id)
    
  } catch (error) {
    console.error('保存笔记到 Redis 失败:', error)
    throw new Error('保存笔记失败')
  }
}

export async function getNote(id: string): Promise<Note | null> {
  const redis = getRedisInstance()
  
  try {
    const noteData = await redis.get(`note:${id}`)
    
    if (!noteData) {
      return null
    }
    
    let note: any
    if (typeof noteData === 'string') {
      note = JSON.parse(noteData)
    } else {
      note = noteData
    }
    
    // 确保 isPasswordProtected 字段存在
    if (note && typeof note === 'object') {
      note.isPasswordProtected = !!(note.passwordHash || note.password)
    }
    
    return note as Note
  } catch (error) {
    console.error('从 Redis 获取笔记失败:', error)
    return null
  }
}

export async function getNoteByShortUrl(shortUrl: string): Promise<Note | null> {
  const redis = getRedisInstance()
  
  try {
    const noteId = await redis.get(`short:${shortUrl}`)
    
    if (!noteId || typeof noteId !== 'string') {
      return null
    }
    
    return await getNote(noteId)
  } catch (error) {
    console.error('通过短链接获取笔记失败:', error)
    return null
  }
}

export async function deleteNote(id: string): Promise<void> {
  const redis = getRedisInstance()
  
  try {
    // Get note first to find short URL
    const note = await getNote(id)
    
    if (note) {
      // Delete note data
      await redis.del(`note:${id}`)
      
      // Delete short URL mapping if exists
      if (note.shortUrl) {
        await redis.del(`short:${note.shortUrl}`)
      }
      
      // Remove from notes index
      await redis.srem('notes:index', id)
    }
  } catch (error) {
    console.error('从 Redis 删除笔记失败:', error)
    throw new Error('删除笔记失败')
  }
}

export async function listNotes(limit: number = 100): Promise<string[]> {
  const redis = getRedisInstance()
  
  try {
    // Get all note IDs from the index
    const noteIds = await redis.smembers('notes:index')
    
    if (!Array.isArray(noteIds)) {
      return []
    }
    
    // Convert to strings and limit results
    return noteIds
      .map(id => typeof id === 'string' ? id : String(id))
      .slice(0, limit)
  } catch (error) {
    console.error('从 Redis 获取笔记列表失败:', error)
    return []
  }
}

export async function noteExists(id: string): Promise<boolean> {
  const redis = getRedisInstance()
  
  try {
    const exists = await redis.exists(`note:${id}`)
    return exists === 1
  } catch (error) {
    console.error('检查笔记是否存在失败:', error)
    return false
  }
}

export async function getNotesByIds(ids: string[]): Promise<Note[]> {
  const redis = getRedisInstance()
  
  try {
    if (ids.length === 0) {
      return []
    }
    
    // Get multiple notes at once
    const keys = ids.map(id => `note:${id}`)
    const results = await redis.mget(...keys)
    
    const notes: Note[] = []
    
    for (const result of results) {
      if (result) {
        try {
          const note = typeof result === 'string' ? JSON.parse(result) : result
          notes.push(note as Note)
        } catch (parseError) {
          console.error('解析笔记数据失败:', parseError)
        }
      }
    }
    
    return notes
  } catch (error) {
    console.error('批量获取笔记失败:', error)
    return []
  }
}

// Health check function
export async function redisHealthCheck(): Promise<boolean> {
  try {
    const redis = getRedisInstance()
    const result = await redis.ping()
    return result === 'PONG'
  } catch (error) {
    console.error('Redis 健康检查失败:', error)
    return false
  }
}

// Get Redis info for debugging
export async function getRedisInfo(): Promise<any> {
  try {
    const redis = getRedisInstance()
    // Upstash Redis doesn't support the INFO command, return basic stats instead
    const ping = await redis.ping()
    return {
      status: ping === 'PONG' ? 'connected' : 'disconnected',
      type: isDevelopment ? 'Development In-Memory Storage' : 'Upstash Redis',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('获取 Redis 信息失败:', error)
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

// Check if short URL already exists
export async function shortUrlExists(shortUrl: string): Promise<boolean> {
  const redis = getRedisInstance()
  
  try {
    const exists = await redis.exists(`short:${shortUrl}`)
    return exists === 1
  } catch (error) {
    console.error('检查短链后缀是否存在失败:', error)
    return false
  }
}