import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // 버킷 목록 확인
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      return NextResponse.json({ 
        success: false,
        error: '버킷 목록을 가져올 수 없습니다: ' + bucketError.message,
        buckets: []
      })
    }

    const projectImagesBucket = buckets?.find(bucket => bucket.name === 'project-images')
    
    if (projectImagesBucket) {
      // 테스트 업로드를 시도해서 권한 확인
      try {
        const testBuffer = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]) // PNG 헤더
        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload('test/check.png', testBuffer, {
            contentType: 'image/png',
            upsert: true
          })

        if (uploadError) {
          return NextResponse.json({ 
            success: true,
            bucketExists: true,
            canUpload: false,
            message: '버킷은 존재하지만 업로드 권한이 없습니다.',
            error: uploadError.message
          })
        }

        // 테스트 파일 삭제
        await supabase.storage
          .from('project-images')
          .remove(['test/check.png'])

        return NextResponse.json({ 
          success: true,
          bucketExists: true,
          canUpload: true,
          message: '✅ Storage가 정상적으로 설정되었습니다!'
        })

      } catch (testError) {
        return NextResponse.json({ 
          success: true,
          bucketExists: true,
          canUpload: false,
          message: '버킷은 존재하지만 업로드 테스트에 실패했습니다.'
        })
      }
    } else {
      return NextResponse.json({ 
        success: true,
        bucketExists: false,
        canUpload: false,
        message: 'project-images 버킷이 존재하지 않습니다. Supabase 대시보드에서 수동으로 생성해주세요.',
        availableBuckets: buckets?.map(b => b.name) || []
      })
    }

  } catch (error) {
    console.error('Storage check error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Storage 상태를 확인할 수 없습니다.',
      bucketExists: false,
      canUpload: false
    }, { status: 500 })
  }
}