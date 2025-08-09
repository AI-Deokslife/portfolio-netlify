import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    const serverPassword = await getStoredPassword()
    console.log('Password check - input:', password?.slice(0, 2) + '***', 'server:', serverPassword?.slice(0, 2) + '***')
    
    if (password?.trim() === serverPassword) {
      return NextResponse.json({ valid: true })
    } else {
      // 비밀번호가 틀려도 200 OK로 응답하고, valid: false만 반환
      return NextResponse.json({ valid: false })
    }
  } catch (error) {
    console.error('Password check error:', error)
    return NextResponse.json({ error: 'Password check failed' }, { status: 500 })
  }
}