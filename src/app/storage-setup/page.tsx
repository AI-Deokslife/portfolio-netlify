'use client'

import { useState } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

const SetupCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
`

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
`

const Description = styled.div`
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
  
  h3 {
    color: #333;
    margin: 1.5rem 0 0.5rem 0;
    font-size: 1.2rem;
  }
  
  ul {
    margin-left: 1rem;
    
    li {
      margin-bottom: 0.5rem;
    }
  }
`


const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
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

    &:hover:not(:disabled) {
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

const StatusBox = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        `
      case 'error':
        return `
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        `
      case 'info':
        return `
          background: #cce7ff;
          border: 1px solid #b3d7ff;
          color: #0c5460;
        `
    }
  }}
`

const BackLink = styled.a`
  display: inline-block;
  margin-top: 2rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`

export default function StorageSetupPage() {
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  const checkStorageStatus = async () => {
    setCheckingStatus(true)
    setStatus({ type: 'info', message: 'Storage 상태를 확인하는 중...' })

    try {
      const response = await fetch('/api/check-storage')
      const result = await response.json()

      if (result.success && result.bucketExists && result.canUpload) {
        setStatus({ type: 'success', message: result.message })
      } else if (result.success && result.bucketExists && !result.canUpload) {
        setStatus({ type: 'error', message: result.message })
      } else if (result.success && !result.bucketExists) {
        setStatus({ type: 'info', message: result.message })
      } else {
        setStatus({ type: 'error', message: result.error || 'Storage 상태 확인 실패' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Storage 상태 확인 중 오류가 발생했습니다.' })
    } finally {
      setCheckingStatus(false)
    }
  }


  return (
    <Container>
      <SetupCard>
        <Title>📸 Supabase Storage 설정</Title>
        
        <Description>
          <p>포트폴리오 이미지를 Supabase Storage에 영구 저장하기 위한 설정입니다.</p>
          
          <h3>🔧 Supabase 대시보드에서 설정하기:</h3>
          <ol style={{ marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li><strong><a href="https://supabase.com/dashboard/project/dmeipyonfxlgufnanewn/storage/buckets" target="_blank" rel="noopener noreferrer" style={{color: '#667eea'}}>▶️ 여기를 클릭</a></strong>하여 Storage 페이지로 이동</li>
            <li><strong>"Create bucket"</strong> 버튼 클릭</li>
            <li>Name 입력: <code style={{background: '#f1f3f4', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold'}}>project-images</code></li>
            <li><strong>"Public bucket"</strong> 체크박스 ✅ 활성화</li>
            <li><strong>"Create bucket"</strong> 클릭하여 완료</li>
          </ol>
          
          <div style={{background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem'}}>
            <strong>💡 중요:</strong> 반드시 <strong>"Public bucket"</strong>을 체크해야 이미지가 웹에서 표시됩니다!
          </div>
          
          <h3>✅ 설정 완료 후 효과:</h3>
          <ul style={{ marginBottom: '1.5rem' }}>
            <li>🖼️ <strong>영구 저장:</strong> 모든 이미지가 Supabase 클라우드에 저장</li>
            <li>⚡ <strong>빠른 로딩:</strong> CDN을 통한 고속 이미지 로딩</li>
            <li>🔗 <strong>안정된 URL:</strong> 새로고침해도 이미지 유지</li>
            <li>❌ <strong>임시 저장 제거:</strong> Base64 방식 완전 대체</li>
          </ul>

          <h3>🔍 설정 상태 확인:</h3>
          <p>아래 버튼으로 버킷이 제대로 생성되었는지 확인할 수 있습니다.</p>
        </Description>

        <ButtonGroup>
          <Button 
            type="button" 
            className="primary" 
            onClick={checkStorageStatus}
            disabled={checkingStatus}
            style={{ width: '100%' }}
          >
            {checkingStatus ? '확인 중...' : '🔍 Storage 상태 확인'}
          </Button>
        </ButtonGroup>

        {status && (
          <StatusBox type={status.type}>
            {status.message}
          </StatusBox>
        )}

        <BackLink href="/">← 포트폴리오로 돌아가기</BackLink>
      </SetupCard>
    </Container>
  )
}