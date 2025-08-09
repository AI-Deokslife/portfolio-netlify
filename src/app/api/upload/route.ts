import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmeipyonfxlgufnanewn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtZWlweW9uZnhsZ3VmbmFuZXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTI2NDksImV4cCI6MjA3MDEyODY0OX0.aI7PQe6PVQGJQ_M3hMMbKUpC1g_gSewTvJLI_NtIDMI'
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
    }

    // 파일 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: '지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 지원)' 
      }, { status: 400 })
    }

    // 파일 크기 체크 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: '파일 크기는 5MB를 초과할 수 없습니다.' 
      }, { status: 400 })
    }

    // 파일명 생성
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    
    // ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // 먼저 버킷이 존재하는지 확인하고 없으면 생성 시도
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some(bucket => bucket.name === 'project-images')
      
      if (!bucketExists) {
        console.log('Creating bucket...')
        await supabase.storage.createBucket('project-images', {
          public: true,
          allowedMimeTypes: ['image/*']
        })
      }
    } catch (bucketError) {
      console.log('Bucket operation failed, continuing with upload:', bucketError)
    }

    // Supabase Storage에 업로드 시도
    const { data, error } = await supabase.storage
      .from('project-images')
      .upload(`uploads/${fileName}`, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (error) {
      console.error('Supabase upload error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Supabase 업로드 실패 시 Base64 데이터 URL로 대체
      console.log('Fallback to Base64 data URL')
      const base64String = Buffer.from(arrayBuffer).toString('base64')
      const mimeType = file.type
      const dataUrl = `data:${mimeType};base64,${base64String}`
      
      return NextResponse.json({ 
        success: true,
        url: dataUrl,
        fileName: fileName,
        fallback: true,
        message: 'Supabase Storage 정책 설정 후 영구 저장 가능'
      })
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from('project-images')
      .getPublicUrl(`uploads/${fileName}`)

    return NextResponse.json({ 
      success: true,
      url: urlData.publicUrl,
      fileName: fileName,
      storage: 'supabase'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: '파일 업로드 중 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}