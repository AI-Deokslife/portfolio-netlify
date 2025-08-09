import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmeipyonfxlgufnanewn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtZWlweW9uZnhsZ3VmbmFuZXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTI2NDksImV4cCI6MjA3MDEyODY0OX0.aI7PQe6PVQGJQ_M3hMMbKUpC1g_gSewTvJLI_NtIDMI'
const supabase = createClient(supabaseUrl, supabaseKey)

// 현재 저장된 비밀번호 가져오기 (데이터베이스에서)
const getStoredPassword = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_password')
      .single()

    if (error) {
      console.error('Error reading password from database:', error)
      return process.env.INITIAL_ADMIN_PASSWORD || 'deokslife'
    }

    return data?.setting_value || (process.env.INITIAL_ADMIN_PASSWORD || 'deokslife')
  } catch (error) {
    console.error('Error reading password from database:', error)
    return process.env.INITIAL_ADMIN_PASSWORD || 'deokslife'
  }
}

// 비밀번호 저장하기 (데이터베이스에)
const savePassword = async (password: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_settings')
      .upsert(
        { setting_key: 'admin_password', setting_value: password },
        { onConflict: 'setting_key' }
      )

    if (error) {
      console.error('Error saving password to database:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error saving password to database:', error)
    return false
  }
}

// 현재 비밀번호 검증
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    const storedPassword = await getStoredPassword()
    
    if (password?.trim() === storedPassword) {
      return NextResponse.json({ valid: true })
    } else {
      return NextResponse.json({ valid: false }, { status: 401 })
    }
  } catch (error) {
    console.error('Password check error:', error)
    return NextResponse.json({ error: 'Password check failed' }, { status: 500 })
  }
}

// 비밀번호 변경
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

    // 현재 비밀번호 확인
    const storedPassword = await getStoredPassword()
    if (currentPassword?.trim() !== storedPassword) {
      return NextResponse.json({ error: '현재 비밀번호가 일치하지 않습니다.' }, { status: 401 })
    }

    // 새 비밀번호 유효성 검사
    if (!newPassword || newPassword.trim().length < 4) {
      return NextResponse.json({ error: '새 비밀번호는 최소 4자 이상이어야 합니다.' }, { status: 400 })
    }

    // 새 비밀번호 저장
    if (await savePassword(newPassword.trim())) {
      return NextResponse.json({ success: true, message: '비밀번호가 변경되었습니다.' })
    } else {
      return NextResponse.json({ error: '비밀번호 저장에 실패했습니다.' }, { status: 500 })
    }
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Password change failed' }, { status: 500 })
  }
}