import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

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

// 앱 수정
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { admin_password, ...appData } = body
    const resolvedParams = await params

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
      updated_at: new Date().toISOString(),
      // 조건부로 새 필드 포함 (DB 스키마가 업데이트되면 자동 작동)
      ...(appData.category && { category: appData.category }),
      ...(appData.development_date && { development_date: appData.development_date }),
      ...(appData.download_url && { download_url: appData.download_url }),
      ...(appData.download_filename && { download_filename: appData.download_filename }),
      ...(appData.download_filesize && { download_filesize: appData.download_filesize })
    }

    const { data, error } = await supabase
      .from('apps')
      .update(safeAppData)
      .eq('id', resolvedParams.id)
      .select()
    
    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ 
        error: '데이터 수정에 실패했습니다: ' + error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error updating app:', error)
    return NextResponse.json({ error: 'Failed to update app' }, { status: 500 })
  }
}

// 앱 삭제
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { admin_password } = body
    const resolvedParams = await params

    // 관리자 비밀번호 확인 (서버에 저장된 현재 비밀번호와 비교)
    const expectedPassword = await getStoredPassword()
    
    if (!admin_password || admin_password.trim() !== expectedPassword.trim()) {
      return NextResponse.json({ 
        error: '관리자 비밀번호가 일치하지 않습니다.'
      }, { status: 401 })
    }

    // 삭제하기 전에 앱 정보를 가져와서 Storage 파일 URL들을 확인
    const { data: app, error: fetchError } = await supabase
      .from('apps')
      .select('image_url, download_url')
      .eq('id', resolvedParams.id)
      .single()

    if (fetchError) {
      console.error('Error fetching app for deletion:', fetchError)
    }

    // 앱 데이터베이스에서 삭제
    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', resolvedParams.id)
    
    if (error) throw error

    // Storage에서 관련 파일들 삭제
    if (app) {
      const storageDeletePromises = []
      
      // 이미지 파일 삭제
      if (app.image_url && !app.image_url.startsWith('data:')) {
        storageDeletePromises.push(
          supabase.storage
            .from('project-images')
            .remove([extractStoragePathFromUrl(app.image_url)])
            .then(result => ({ type: 'image', ...result }))
        )
      }
      
      // 다운로드 파일 삭제
      if (app.download_url && !app.download_url.startsWith('data:')) {
        storageDeletePromises.push(
          supabase.storage
            .from('project-files')
            .remove([extractStoragePathFromUrl(app.download_url)])
            .then(result => ({ type: 'file', ...result }))
        )
      }

      // Storage 삭제 실행 (실패해도 앱 삭제는 성공으로 처리)
      if (storageDeletePromises.length > 0) {
        try {
          const storageResults = await Promise.all(storageDeletePromises)
          storageResults.forEach(result => {
            if (result.error) {
              console.error(`Storage ${result.type} deletion error:`, result.error)
            } else {
              console.log(`Successfully deleted storage ${result.type}`)
            }
          })
        } catch (storageError) {
          console.error('Storage deletion error:', storageError)
        }
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting app:', error)
    return NextResponse.json({ error: 'Failed to delete app' }, { status: 500 })
  }
}

// Storage URL에서 파일 경로 추출 함수
function extractStoragePathFromUrl(url: string): string {
  try {
    if (!url) return ''
    
    // project-images 버킷의 경우
    if (url.includes('/project-images/')) {
      const match = url.match(/\/project-images\/(.+)/)
      return match ? match[1] : ''
    }
    
    // project-files 버킷의 경우  
    if (url.includes('/project-files/')) {
      const match = url.match(/\/project-files\/(.+)/)
      return match ? match[1] : ''
    }
    
    return ''
  } catch (error) {
    console.error('Error extracting storage path:', error)
    return ''
  }
}