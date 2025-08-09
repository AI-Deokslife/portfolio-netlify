import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const adminPassword = formData.get('admin_password') as string

    // 관리자 비밀번호 확인
    const expectedPassword = process.env.INITIAL_ADMIN_PASSWORD || 'deokslife'
    if (!adminPassword || adminPassword.trim() !== expectedPassword.trim()) {
      return NextResponse.json({ 
        error: '관리자 비밀번호가 일치하지 않습니다.' 
      }, { status: 401 })
    }

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

    // 파일을 Base64로 변환하여 임시 저장
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64String = buffer.toString('base64')
    const mimeType = file.type
    const dataUrl = `data:${mimeType};base64,${base64String}`
    
    // 임시로 Data URL 반환 (실제 환경에서는 CDN 또는 다른 스토리지 사용 권장)
    return NextResponse.json({ 
      success: true,
      url: dataUrl,
      fileName: file.name,
      message: '임시 업로드 완료 (Supabase Storage 정책 설정 후 영구 저장 권장)'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: '파일 업로드 중 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}