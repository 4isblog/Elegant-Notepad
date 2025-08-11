import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

interface YiyanData {
  code: number
  msg: string
}

export function Yiyan() {
  const [yiyan, setYiyan] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const fetchYiyan = async () => {
    setLoading(true)
    try {
      // 通过API路由获取一言，避免在客户端暴露API密钥
      const response = await fetch('/api/yiyan')
      const data: YiyanData = await response.json()
      
      if (data.code === 200) {
        setYiyan(data.msg)
      } else {
        setYiyan('生活需要一点智慧，学习需要一点耐心。')
      }
    } catch (error) {
      console.error('获取一言失败:', error)
      setYiyan('保持积极的心态，每一天都是新的开始。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchYiyan()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.p
                  key={yiyan}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed italic"
                >
                  {loading ? '加载中...' : `"${yiyan}"`}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 