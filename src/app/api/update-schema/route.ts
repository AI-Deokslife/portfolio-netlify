import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmeipyonfxlgufnanewn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtZWlweW9uZnhsZ3VmbmFuZXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTI2NDksImV4cCI6MjA3MDEyODY0OX0.aI7PQe6PVQGJQ_M3hMMbKUpC1g_gSewTvJLI_NtIDMI'
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

    // 스키마 업데이트 SQL들
    const schemaUpdates = [
      // category 컬럼 추가
      `ALTER TABLE apps ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '웹 프로젝트';`,
      
      // development_date 컬럼 추가 (YYYY-MM 형식)
      `ALTER TABLE apps ADD COLUMN IF NOT EXISTS development_date TEXT;`,
    ]

    const results = []
    
    for (const sql of schemaUpdates) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql })
        
        if (error) {
          console.error(`Schema update error:`, error)
          results.push({ 
            sql: sql.substring(0, 50) + '...', 
            success: false, 
            error: error.message 
          })
        } else {
          results.push({ 
            sql: sql.substring(0, 50) + '...', 
            success: true 
          })
        }
      } catch (err) {
        console.error(`Schema update exception:`, err)
        results.push({ 
          sql: sql.substring(0, 50) + '...', 
          success: false, 
          error: 'SQL execution failed' 
        })
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'DB 스키마 업데이트 시도 완료',
      results
    })

  } catch (error) {
    console.error('Schema update error:', error)
    return NextResponse.json({ 
      error: '스키마 업데이트 중 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}