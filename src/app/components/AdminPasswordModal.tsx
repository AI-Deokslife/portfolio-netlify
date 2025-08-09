'use client'
import { useState } from 'react'
import styled from 'styled-components'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 2rem;
`

const Modal = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`

const Title = styled.h2`
  margin-bottom: 1rem;
  text-align: center;
`

const Message = styled.p`
  margin-bottom: 1.5rem;
  text-align: center;
  color: #666;
`

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`

const Actions = styled.div`
  display: flex;
  gap: 1rem;
`

const Button = styled.button`
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;

  &.primary {
    background: #dc3545;
    color: white;
  }

  &.secondary {
    background: #f8f9fa;
    color: #495057;
  }
`

interface AdminPasswordModalProps {
  title: string;
  message: string;
  onConfirm: (password: string) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function AdminPasswordModal({ 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  loading 
}: AdminPasswordModalProps) {
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(password)
  }

  return (
    <Overlay>
      <Modal>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="관리자 비밀번호"
            required
          />
          <Actions>
            <Button type="button" className="secondary" onClick={onCancel}>
              취소
            </Button>
            <Button type="submit" className="primary" disabled={loading}>
              {loading ? '처리중...' : '확인'}
            </Button>
          </Actions>
        </form>
      </Modal>
    </Overlay>
  )
}