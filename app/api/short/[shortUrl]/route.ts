import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, ShareableNote } from '@/types'
import { getNoteByShortUrl, deleteNote } from '@/lib/redis'


export async function GET(
  request: NextRequest,
  { params }: { params: { shortUrl: string } }
): Promise<NextResponse<ApiResponse<ShareableNote>>> {
  try {
    const { shortUrl } = params
    
    if (!shortUrl) {
      return NextResponse.json(
        { success: false, error: '短链接是必需的' },
        { status: 400 }
      )
    }

    const note = await getNoteByShortUrl(shortUrl)
    
    if (!note) {
      return NextResponse.json(
        { success: false, error: '笔记未找到' },
        { status: 404 }
      )
    }



    // Return shareable note data (without password hash)
    const shareableNote: ShareableNote = {
      id: note.id,
      title: note.title,
      content: note.isPasswordProtected ? '' : note.content, // 如果有密码保护，不返回内容
      shortUrl: note.shortUrl!,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,  // 添加更新时间
      isPasswordProtected: note.isPasswordProtected || false
    }

    return NextResponse.json({
      success: true,
      note: shareableNote,
      message: '笔记获取成功'
    })

  } catch (error: any) {
    console.error('通过短链接获取笔记出错:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '获取笔记失败',
        message: error.message 
      },
      { status: 500 }
    )
  }
}