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

    // SQL을 통한 Storage 정책 설정
    const policies = [
      // INSERT 정책: 모든 사용자가 project-images 버킷에 파일 업로드 가능
      {
        name: 'Enable insert for all users',
        sql: `
          CREATE POLICY "Enable insert for all users" ON storage.objects 
          FOR INSERT TO public 
          WITH CHECK (bucket_id = 'project-images');
        `
      },
      // SELECT 정책: 모든 사용자가 project-images 버킷의 파일 조회 가능  
      {
        name: 'Enable select for all users',
        sql: `
          CREATE POLICY "Enable select for all users" ON storage.objects 
          FOR SELECT TO public 
          USING (bucket_id = 'project-images');
        `
      }
    ]

    const results = []
    
    for (const policy of policies) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: policy.sql 
        })
        
        if (error) {
          console.error(`Policy ${policy.name} error:`, error)
          results.push({ 
            policy: policy.name, 
            success: false, 
            error: error.message 
          })
        } else {
          results.push({ 
            policy: policy.name, 
            success: true 
          })
        }
      } catch (err) {
        console.error(`Policy ${policy.name} exception:`, err)
        results.push({ 
          policy: policy.name, 
          success: false, 
          error: 'SQL execution failed' 
        })
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Storage 정책 설정 시도 완료',
      results
    })

  } catch (error) {
    console.error('Setup policies error:', error)
    return NextResponse.json({ 
      error: '정책 설정 중 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}