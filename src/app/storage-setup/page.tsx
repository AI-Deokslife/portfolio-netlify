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

const InputGroup = styled.div`
  margin-bottom: 2rem;
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

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)
  const [setupComplete, setSetupComplete] = useState(false)

  const setupStorage = async () => {
    if (!password.trim()) {
      setStatus({ type: 'error', message: '관리자 비밀번호를 입력해주세요.' })
      return
    }

    setLoading(true)
    setStatus({ type: 'info', message: 'Storage 버킷을 설정하는 중...' })

    try {
      // 1. Storage 버킷 생성
      const storageResponse = await fetch('/api/setup-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_password: password })
      })

      if (!storageResponse.ok) {
        const errorData = await storageResponse.json()
        throw new Error(errorData.error || 'Storage 설정 실패')
      }

      const storageResult = await storageResponse.json()
      setStatus({ type: 'success', message: storageResult.message })

      // 2. Storage 정책 설정
      setTimeout(async () => {
        setStatus({ type: 'info', message: 'Storage 정책을 설정하는 중...' })
        
        try {
          const policyResponse = await fetch('/api/setup-policies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin_password: password })
          })

          const policyResult = await policyResponse.json()
          
          if (policyResult.success) {
            setStatus({ 
              type: 'success', 
              message: '✅ Storage 설정이 완료되었습니다! 이제 이미지가 Supabase Storage에 영구 저장됩니다.' 
            })
            setSetupComplete(true)
          } else {
            setStatus({ 
              type: 'info', 
              message: 'Storage 버킷은 생성되었으나, 정책 설정은 수동으로 진행해야 할 수 있습니다.' 
            })
          }
        } catch (policyError) {
          setStatus({ 
            type: 'info', 
            message: 'Storage 버킷은 생성되었습니다. 이미지 업로드를 테스트해보세요!' 
          })
        }
      }, 1000)

    } catch (error: any) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <SetupCard>
        <Title>📸 Supabase Storage 설정</Title>
        
        <Description>
          <p>포트폴리오 이미지를 Supabase Storage에 영구 저장하기 위한 설정입니다.</p>
          
          <h3>설정 과정:</h3>
          <ul>
            <li>✅ <strong>project-images</strong> 저장소 버킷 생성</li>
            <li>✅ 이미지 업로드 권한 설정</li>
            <li>✅ 공개 접근 권한 설정</li>
          </ul>
          
          <p><strong>⚠️ 이 설정은 최초 1회만 실행하면 됩니다.</strong></p>
        </Description>

        {!setupComplete && (
          <>
            <InputGroup>
              <Label htmlFor="password">관리자 비밀번호</Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="관리자 비밀번호를 입력하세요"
                disabled={loading}
              />
            </InputGroup>

            <ButtonGroup>
              <Button 
                type="button" 
                className="primary" 
                onClick={setupStorage}
                disabled={loading}
              >
                {loading ? '설정 중...' : '🚀 Storage 설정 시작'}
              </Button>
            </ButtonGroup>
          </>
        )}

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