import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

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

// 모든 앱 조회
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .order('development_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching apps:', error)
    return NextResponse.json({ error: 'Failed to fetch apps' }, { status: 500 })
  }
}

// 새 앱 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { admin_password, ...appData } = body

    // 관리자 비밀번호 확인 (서버에 저장된 현재 비밀번호와 비교)
    const expectedPassword = await getStoredPassword()
    if (!admin_password || admin_password.trim() !== expectedPassword.trim()) {
      return NextResponse.json({ error: '관리자 비밀번호가 일치하지 않습니다.' }, { status: 401 })
    }

    // 기존 컬럼과 새 컬럼 안전하게 처리 (DB 컬럼이 있을 때만 포함)
    const safeAppData = {
      title: appData.title,
      description: appData.description,
      url: appData.url,
      github_url: appData.github_url,
      image_url: appData.image_url,
      tech_stack: appData.tech_stack,
      // 조건부로 새 필드 포함 (DB 스키마가 업데이트되면 자동 작동)
      ...(appData.category && { category: appData.category }),
      ...(appData.development_date && { development_date: appData.development_date })
    }

    const { data, error } = await supabase
      .from('apps')
      .insert([safeAppData])
      .select()
    
    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ 
        error: '데이터 저장에 실패했습니다: ' + error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error creating app:', error)
    return NextResponse.json({ error: 'Failed to create app' }, { status: 500 })
  }
}