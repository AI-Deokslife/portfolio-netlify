import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmeipyonfxlgufnanewn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtZWlweW9uZnhsZ3VmbmFuZXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTI2NDksImV4cCI6MjA3MDEyODY0OX0.aI7PQe6PVQGJQ_M3hMMbKUpC1g_gSewTvJLI_NtIDMI'
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    // admin_settings 테이블 생성 (이미 있으면 무시)
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS admin_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(50) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // 초기 비밀번호 설정 (이미 있으면 무시)
    const insertPasswordQuery = `
      INSERT INTO admin_settings (setting_key, setting_value) 
      VALUES ('admin_password', 'deokslife')
      ON CONFLICT (setting_key) DO NOTHING;
    `

    // 테이블 생성
    const { error: createError } = await supabase.rpc('exec_sql', { 
      query: createTableQuery 
    })
    
    if (createError) {
      console.error('Table creation error:', createError)
      return NextResponse.json({ error: 'Failed to create admin_settings table' }, { status: 500 })
    }

    // 초기 데이터 삽입
    const { error: insertError } = await supabase.rpc('exec_sql', { 
      query: insertPasswordQuery 
    })

    if (insertError) {
      console.error('Initial data insertion error:', insertError)
      return NextResponse.json({ error: 'Failed to insert initial password' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'admin_settings table created and initialized successfully' 
    })
  } catch (error) {
    console.error('Admin table setup error:', error)
    return NextResponse.json({ error: 'Failed to setup admin table' }, { status: 500 })
  }
}