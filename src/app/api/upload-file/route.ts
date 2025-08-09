import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmeipyonfxlgufnanewn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtZWlweW9uZnhsZ3VmbmFuZXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTI2NDksImV4cCI6MjA3MDEyODY0OX0.aI7PQe6PVQGJQ_M3hMMbKUpC1g_gSewTvJLI_NtIDMI'
const supabase = createClient(supabaseUrl, supabaseKey)

// 허용되는 파일 타입
const allowedTypes = [
  // 이미지
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  
  // 문서
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  
  // 텍스트
  'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript',
  
  // 압축
  'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
  
  // 실행파일
  'application/x-msdownload', 'application/x-msdos-program', 'application/x-ms-dos-executable',
  'application/x-exe', 'application/x-winexe', 'application/x-msi',
  
  // 개발 관련
  'application/json', 'application/xml',
  
  // 기타
  'application/octet-stream' // 일반적인 바이너리 파일
]

// 파일 확장자로 추가 검증
const allowedExtensions = [
  // 이미지
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  
  // 문서
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  
  // 텍스트
  '.txt', '.csv', '.html', '.css', '.js', '.ts',
  
  // 압축
  '.zip', '.rar', '.7z',
  
  // 실행파일
  '.exe', '.msi', '.dmg', '.pkg',
  
  // 개발 관련
  '.json', '.xml', '.yaml', '.yml',
  
  // 기타 개발 파일들
  '.py', '.java', '.cpp', '.c', '.h', '.php', '.rb', '.go', '.rs'
]

const maxFileSize = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '파일이 선택되지 않았습니다.' }, { status: 400 })
    }

    // 파일 크기 검증
    if (file.size > maxFileSize) {
      return NextResponse.json({ 
        error: `파일 크기가 너무 큽니다. 최대 ${Math.round(maxFileSize / 1024 / 1024)}MB까지 업로드 가능합니다.` 
      }, { status: 400 })
    }

    // 파일 타입 및 확장자 검증
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)
    
    if (!isValidType) {
      return NextResponse.json({ 
        error: '지원되지 않는 파일 형식입니다. 문서, 이미지, 압축파일, 실행파일 등을 업로드해주세요.' 
      }, { status: 400 })
    }

    // 파일명 안전하게 처리
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const safeFileName = `${timestamp}-${randomString}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    try {
      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from('project-files')
        .upload(safeFileName, file, {
          contentType: file.type,
          upsert: false
        })

      if (error) {
        console.error('Supabase Storage 업로드 오류:', error)
        
        // Storage 정책 오류인 경우
        if (error.message.includes('policy')) {
          return NextResponse.json({ 
            error: 'Supabase Storage 업로드에 실패했습니다. 저장소 정책을 확인해주세요.' 
          }, { status: 500 })
        }
        
        return NextResponse.json({ 
          error: 'Storage 업로드 실패: ' + error.message 
        }, { status: 500 })
      }

      // 업로드된 파일의 공개 URL 생성
      const { data: urlData } = supabase.storage
        .from('project-files')
        .getPublicUrl(data.path)

      return NextResponse.json({
        url: urlData.publicUrl,
        fileName: safeFileName,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        message: '파일 업로드가 완료되었습니다.'
      })

    } catch (storageError: any) {
      console.error('Storage 업로드 예외:', storageError)
      return NextResponse.json({ 
        error: 'Storage 업로드 중 오류가 발생했습니다: ' + storageError.message 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('파일 업로드 오류:', error)
    return NextResponse.json({ 
      error: '파일 업로드 처리 중 오류가 발생했습니다: ' + error.message 
    }, { status: 500 })
  }
}