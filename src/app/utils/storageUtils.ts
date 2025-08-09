import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmeipyonfxlgufnanewn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtZWlweW9uZnhsZ3VmbmFuZXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTI2NDksImV4cCI6MjA3MDEyODY0OX0.aI7PQe6PVQGJQ_M3hMMbKUpC1g_gSewTvJLI_NtIDMI'
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * URL에서 Storage 파일 경로를 추출합니다
 */
export function extractStoragePathFromUrl(url: string, bucketName: string): string | null {
  try {
    if (!url || typeof url !== 'string') return null
    
    // Supabase Storage URL 패턴: .../storage/v1/object/public/bucket-name/path/to/file
    const storageUrlPattern = new RegExp(`/storage/v1/object/public/${bucketName}/(.+)`)
    const match = url.match(storageUrlPattern)
    
    if (match && match[1]) {
      return decodeURIComponent(match[1])
    }
    
    return null
  } catch (error) {
    console.error('Error extracting storage path:', error)
    return null
  }
}

/**
 * Storage에서 파일을 삭제합니다
 */
export async function deleteStorageFile(bucketName: string, filePath: string): Promise<{ success: boolean, error?: string }> {
  try {
    if (!filePath) {
      return { success: false, error: 'File path is required' }
    }

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath])

    if (error) {
      console.error(`Storage delete error for ${filePath}:`, error)
      return { success: false, error: error.message }
    }

    console.log(`Successfully deleted storage file: ${filePath}`)
    return { success: true }
  } catch (error: any) {
    console.error(`Unexpected error deleting storage file ${filePath}:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * URL에서 Storage 파일을 삭제합니다
 */
export async function deleteStorageFileByUrl(url: string, bucketName: string): Promise<{ success: boolean, error?: string }> {
  try {
    if (!url || url.startsWith('data:')) {
      // Base64 데이터 URL은 Storage에 저장되지 않으므로 삭제할 필요 없음
      return { success: true }
    }

    const filePath = extractStoragePathFromUrl(url, bucketName)
    
    if (!filePath) {
      console.log(`No storage path found in URL: ${url}`)
      return { success: true } // 삭제할 파일이 없는 것은 성공으로 처리
    }

    return await deleteStorageFile(bucketName, filePath)
  } catch (error: any) {
    console.error('Error deleting storage file by URL:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 이미지 Storage 파일 삭제
 */
export async function deleteImageFile(imageUrl: string): Promise<{ success: boolean, error?: string }> {
  return await deleteStorageFileByUrl(imageUrl, 'project-images')
}

/**
 * 프로그램 파일 Storage 삭제
 */
export async function deleteProgramFile(fileUrl: string): Promise<{ success: boolean, error?: string }> {
  return await deleteStorageFileByUrl(fileUrl, 'project-files')
}

/**
 * 프로젝트와 관련된 모든 Storage 파일 삭제
 */
export async function deleteProjectFiles(imageUrl?: string, downloadUrl?: string): Promise<{ 
  imageDeleted: boolean, 
  fileDeleted: boolean, 
  errors: string[] 
}> {
  const results = {
    imageDeleted: false,
    fileDeleted: false,
    errors: [] as string[]
  }

  // 이미지 파일 삭제
  if (imageUrl) {
    const imageResult = await deleteImageFile(imageUrl)
    results.imageDeleted = imageResult.success
    if (!imageResult.success && imageResult.error) {
      results.errors.push(`Image deletion failed: ${imageResult.error}`)
    }
  } else {
    results.imageDeleted = true // 삭제할 이미지가 없으면 성공으로 처리
  }

  // 다운로드 파일 삭제
  if (downloadUrl) {
    const fileResult = await deleteProgramFile(downloadUrl)
    results.fileDeleted = fileResult.success
    if (!fileResult.success && fileResult.error) {
      results.errors.push(`File deletion failed: ${fileResult.error}`)
    }
  } else {
    results.fileDeleted = true // 삭제할 파일이 없으면 성공으로 처리
  }

  return results
}