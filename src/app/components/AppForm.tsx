'use client'
import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { getStoredPassword } from '../utils/passwordUtils'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
`

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
`

const Title = styled.h2`
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
`

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background: rgba(255, 255, 255, 0.8);

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`

const Button = styled.button`
  flex: 1;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: linear-gradient(45deg, #4ECDC4, #44A08D);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(78, 205, 196, 0.3);
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }

  &.secondary {
    background: #f8f9fa;
    color: #495057;
    border: 2px solid #dee2e6;

    &:hover {
      background: #e9ecef;
    }
  }
`

const ImageUploadArea = styled.div<{ isDragging: boolean }>`
  border: 2px dashed ${props => props.isDragging ? '#667eea' : '#e1e5e9'};
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  background: ${props => props.isDragging ? 'rgba(102, 126, 234, 0.05)' : 'rgba(255, 255, 255, 0.8)'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }

  .upload-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    display: block;
    color: #667eea;
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

const ImagePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #e1e5e9;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);

  img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
  }

  .image-info {
    flex: 1;
    
    .filename {
      font-weight: 500;
      color: #333;
      margin-bottom: 0.25rem;
    }
    
    .filesize {
      font-size: 0.8rem;
      color: #666;
    }
  }

  .remove-btn {
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
    height: 4px;
    background: #e1e5e9;
    border-radius: 2px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: #667eea;
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

interface App {
  id: number;
  title: string;
  description: string;
  url: string;
  github_url?: string;
  image_url?: string;
  tech_stack?: string;
  category?: string;
  development_date?: string;
}

interface AppFormProps {
  app?: App | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function AppForm({ app, onSubmit, onCancel }: AppFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    github_url: '',
    image_url: '',
    tech_stack: '',
    category: '웹 프로젝트',
    development_date: '',
    admin_password: ''
  })
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<{url: string, filename: string, size: number} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (app) {
      setFormData({
        title: app.title || '',
        description: app.description || '',
        url: app.url || '',
        github_url: app.github_url || '',
        image_url: app.image_url || '',
        tech_stack: app.tech_stack || '',
        category: (app as any).category || '웹 프로젝트',
        development_date: (app as any).development_date || '',
        admin_password: '' // 사용자가 직접 입력하도록
      })
      if (app.image_url) {
        setUploadedImage({
          url: app.image_url,
          filename: 'existing-image.jpg',
          size: 0
        })
      }
    }
  }, [app])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      if (response.ok) {
        const data = await response.json()
        setUploadedImage({
          url: data.url,
          filename: data.fileName,
          size: file.size
        })
        setFormData({
          ...formData,
          image_url: data.url
        })
        setUploadProgress(100)
      } else {
        const errorData = await response.json()
        alert(errorData.error || '이미지 업로드에 실패했습니다.')
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error)
      alert('이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleImageUpload(imageFile)
    } else {
      alert('이미지 파일만 업로드할 수 있습니다.')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
  }

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click()
  }

  const removeUploadedImage = () => {
    setUploadedImage(null)
    setFormData({
      ...formData,
      image_url: ''
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 비밀번호가 입력되지 않은 경우 에러
      if (!formData.admin_password.trim()) {
        alert('관리자 비밀번호를 입력해주세요.')
        return
      }

      const method = app ? 'PUT' : 'POST'
      const url = app ? `/api/apps/${app.id}` : '/api/apps'
      
      console.log('Checking entered password')
      
      // 입력된 비밀번호 검증
      const checkResponse = await fetch('/api/password-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: formData.admin_password.trim() })
      })
      
      if (!checkResponse.ok) {
        console.error('Password check request failed:', checkResponse.status)
        alert('비밀번호 검증 중 오류가 발생했습니다.')
        return
      }

      const result = await checkResponse.json()
      console.log('Password check result:', result)
      
      if (!result.valid) {
        alert('관리자 비밀번호가 일치하지 않습니다.')
        return
      }
      
      // 유효한 비밀번호를 localStorage에 동기화
      localStorage.setItem('adminPassword', formData.admin_password.trim())
      
      console.log('Password validated, saving app')
      
      // 유효한 비밀번호로 앱 저장
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        console.log('App saved successfully')
        onSubmit()
      } else {
        const data = await response.json()
        console.error('App save error:', data)
        alert(data.error || `저장에 실패했습니다. (${response.status})`)
      }
    } catch (error) {
      console.error('앱 저장에 실패했습니다:', error)
      alert('앱 저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !window.getSelection()?.toString()) {
      onCancel()
    }
  }

  return (
    <Overlay onClick={handleOverlayClick}>
      <FormContainer>
        <Title>{app ? '앱 수정' : '새 앱 추가'}</Title>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="admin_password">관리자 비밀번호 *</Label>
            <Input
              type="password"
              id="admin_password"
              name="admin_password"
              value={formData.admin_password}
              onChange={handleChange}
              placeholder="프로젝트 저장을 위해 관리자 비밀번호를 입력하세요"
              title="비밀번호 변경은 🗂️ 관리 버튼에서 가능합니다"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="title">앱 이름 *</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="예: 날씨 앱"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">설명</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="앱에 대한 간단한 설명을 입력하세요"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="url">앱 URL</Label>
            <Input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://myapp.com"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input
              type="url"
              id="github_url"
              name="github_url"
              value={formData.github_url}
              onChange={handleChange}
              placeholder="https://github.com/username/repo"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="tech_stack">기술 스택</Label>
            <Input
              type="text"
              id="tech_stack"
              name="tech_stack"
              value={formData.tech_stack}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB 등"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="category">프로젝트 분류</Label>
            <Input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="웹 프로젝트, 모바일 앱, 데스크톱 프로그램 등"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="development_date">개발 시기</Label>
            <Input
              type="month"
              id="development_date"
              name="development_date"
              value={formData.development_date}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="image_upload">이미지</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {!uploadedImage && !isUploading && (
              <ImageUploadArea
                isDragging={isDragging}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleUploadAreaClick}
              >
                <span className="upload-icon">📸</span>
                <div className="upload-text">이미지를 드래그하거나 클릭해서 업로드</div>
                <div className="upload-hint">JPG, PNG, GIF, WebP (최대 5MB)</div>
              </ImageUploadArea>
            )}
            
            {isUploading && (
              <UploadProgress>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
                <div className="progress-text">업로드 중...</div>
              </UploadProgress>
            )}
            
            {uploadedImage && (
              <ImagePreview>
                <img src={uploadedImage.url} alt="업로드된 이미지" />
                <div className="image-info">
                  <div className="filename">{uploadedImage.filename}</div>
                  <div className="filesize">{formatFileSize(uploadedImage.size)}</div>
                </div>
                <button type="button" className="remove-btn" onClick={removeUploadedImage}>
                  삭제
                </button>
              </ImagePreview>
            )}
            
            <Input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="또는 직접 이미지 URL을 입력하세요"
              style={{ marginTop: '1rem' }}
            />
          </FormGroup>

          <Actions>
            <Button type="button" className="secondary" onClick={onCancel}>
              취소
            </Button>
            <Button type="submit" className="primary" disabled={loading}>
              {loading ? '저장 중...' : (app ? '수정하기' : '추가하기')}
            </Button>
          </Actions>
        </form>
      </FormContainer>
    </Overlay>
  )
}