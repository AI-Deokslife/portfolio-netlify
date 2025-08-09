import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { admin_password } = body

    // 관리자 비밀번호 확인
    const expectedPassword = process.env.INITIAL_ADMIN_PASSWORD || 'deokslife'
    if (!admin_password || admin_password.trim() !== expectedPassword.trim()) {
      return NextResponse.json({ 
        error: '관리자 비밀번호가 일치하지 않습니다.' 
      }, { status: 401 })
    }

    // 기존 버킷 목록 확인
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === 'project-images')
    
    if (!bucketExists) {
      // project-images 버킷 생성
      const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('project-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (bucketError) {
        console.error('Failed to create bucket:', bucketError)
        return NextResponse.json({ 
          error: '버킷 생성에 실패했습니다: ' + bucketError.message 
        }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true,
        message: 'project-images 버킷이 성공적으로 생성되었습니다.',
        bucket: bucketData
      })
    } else {
      return NextResponse.json({ 
        success: true,
        message: 'project-images 버킷이 이미 존재합니다.'
      })
    }

  } catch (error) {
    console.error('Setup storage error:', error)
    return NextResponse.json({ 
      error: '스토리지 설정 중 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}