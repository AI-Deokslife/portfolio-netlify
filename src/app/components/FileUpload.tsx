'use client'
import { useState, useRef, useCallback } from 'react'
import styled from 'styled-components'

const FileUploadContainer = styled.div`
  margin-top: 0.5rem;
`

const UploadArea = styled.div<{ isDragging: boolean; hasFile: boolean }>`
  border: 2px dashed ${props => 
    props.isDragging ? '#667eea' : 
    props.hasFile ? '#28a745' : '#e1e5e9'
  };
  border-radius: 10px;
  padding: ${props => props.hasFile ? '1rem' : '2rem'};
  text-align: center;
  background: ${props => 
    props.isDragging ? 'rgba(102, 126, 234, 0.05)' : 
    props.hasFile ? 'rgba(40, 167, 69, 0.05)' : 'rgba(255, 255, 255, 0.8)'
  };
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.hasFile ? '#28a745' : '#667eea'};
    background: ${props => props.hasFile ? 'rgba(40, 167, 69, 0.08)' : 'rgba(102, 126, 234, 0.05)'};
  }

  .upload-icon {
    font-size: ${props => props.hasFile ? '2rem' : '3rem'};
    margin-bottom: ${props => props.hasFile ? '0.5rem' : '1rem'};
    display: block;
    color: ${props => props.hasFile ? '#28a745' : '#667eea'};
  }

  .upload-text {
    color: #555;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .upload-hint {
    color: #999;
    font-size: 0.8rem;
  }
`

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;

  .file-icon {
    font-size: 2rem;
    min-width: 40px;
    text-align: center;
  }

  .file-info {
    flex: 1;
    
    .filename {
      font-weight: 500;
      color: #333;
      margin-bottom: 0.25rem;
      word-break: break-all;
    }
    
    .filesize {
      font-size: 0.8rem;
      color: #666;
    }
  }

  .file-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem;
    cursor: pointer;
    font-size: 0.8rem;
    
    &:hover {
      background: #c82333;
    }
  }
`

const UploadProgress = styled.div`
  margin-top: 1rem;
  
  .progress-bar {
    width: 100%;
    height: 6px;
    background: #e1e5e9;
    border-radius: 3px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(45deg, #4ECDC4, #44A08D);
      transition: width 0.3s ease;
    }
  }
  
  .progress-text {
    text-align: center;
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.5rem;
  }
`

export interface UploadedFile {
  url: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
}

interface FileUploadProps {
  onFileUploaded: (file: UploadedFile) => void;
  currentFile?: UploadedFile | null;
  onFileRemoved: () => void;
}

export default function FileUpload({ onFileUploaded, currentFile, onFileRemoved }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (fileType: string, fileName: string) => {
    const name = fileName.toLowerCase()
    
    // Excel 파일
    if (name.endsWith('.xlsx') || name.endsWith('.xls') || fileType.includes('spreadsheet')) return '📊'
    
    // Word 파일
    if (name.endsWith('.docx') || name.endsWith('.doc') || fileType.includes('wordprocessingml')) return '📝'
    
    // PDF 파일
    if (name.endsWith('.pdf') || fileType.includes('pdf')) return '📄'
    
    // 실행 파일
    if (name.endsWith('.exe') || name.endsWith('.msi') || name.endsWith('.dmg')) return '⚙️'
    
    // 압축 파일
    if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) return '📦'
    
    // 이미지 파일
    if (fileType.startsWith('image/')) return '🖼️'
    
    // 비디오 파일
    if (fileType.startsWith('video/')) return '🎬'
    
    // 오디오 파일
    if (fileType.startsWith('audio/')) return '🎵'
    
    // 텍스트 파일
    if (fileType.startsWith('text/') || name.endsWith('.txt')) return '📄'
    
    // 코드 파일
    if (name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.py') || 
        name.endsWith('.java') || name.endsWith('.cpp') || name.endsWith('.html')) return '💻'
    
    // 기본 파일 아이콘
    return '📁'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Upload failed: ${response.status}`)
      }

      const data = await response.json()
      setUploadProgress(100)
      
      const uploadedFile: UploadedFile = {
        url: data.url,
        fileName: data.fileName,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type
      }

      onFileUploaded(uploadedFile)
      
    } catch (error: any) {
      console.error('File upload error:', error)
      alert(error.message || '파일 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      uploadFile(files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleUploadAreaClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  const handleRemoveFile = () => {
    onFileRemoved()
  }

  return (
    <FileUploadContainer>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="*/*"
      />

      {!currentFile && !isUploading && (
        <UploadArea
          isDragging={isDragging}
          hasFile={false}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleUploadAreaClick}
        >
          <span className="upload-icon">📎</span>
          <div className="upload-text">파일을 드래그하거나 클릭해서 업로드</div>
          <div className="upload-hint">Excel, Word, PDF, 실행파일 등 (최대 50MB)</div>
        </UploadArea>
      )}

      {currentFile && !isUploading && (
        <UploadArea isDragging={isDragging} hasFile={true} onClick={handleUploadAreaClick}>
          <FilePreview>
            <div className="file-icon">
              {getFileIcon(currentFile.fileType, currentFile.originalName)}
            </div>
            <div className="file-info">
              <div className="filename">{currentFile.originalName}</div>
              <div className="filesize">{formatFileSize(currentFile.fileSize)}</div>
            </div>
            <div className="file-actions">
              <button 
                type="button" 
                className="action-btn" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFile()
                }}
              >
                삭제
              </button>
            </div>
          </FilePreview>
        </UploadArea>
      )}

      {isUploading && (
        <UploadProgress>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
          </div>
          <div className="progress-text">파일 업로드 중...</div>
        </UploadProgress>
      )}
    </FileUploadContainer>
  )
}