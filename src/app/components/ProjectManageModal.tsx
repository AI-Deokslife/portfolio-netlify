'use client'
import { useState, useEffect } from 'react'
import styled from 'styled-components'

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

const ModalContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
`

const Title = styled.h2`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
`

const PasswordSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
  border: 2px solid #e9ecef;
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

const ProjectList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  background: white;
`

const ProjectItem = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f3f4;
  background: ${props => props.isSelected ? '#e3f2fd' : 'white'};
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.isSelected ? '#e3f2fd' : '#f8f9fa'};
  }
  
  &:last-child {
    border-bottom: none;
  }
`

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`

const ProjectInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const ProjectTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
`

const ProjectMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #666;
`

const ProjectDate = styled.span`
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #e9ecef;
`

const ProjectCategory = styled.span`
  background: #fff3cd;
  color: #000;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ffeaa7;
  font-weight: 500;
`

const SelectAllSection = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 2px solid #e9ecef;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 500;
  color: #495057;
`

const SelectedCount = styled.div`
  margin: 1rem 0;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  
  .count {
    color: #dc3545;
    font-weight: 600;
  }
`

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
`

const Button = styled.button`
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: linear-gradient(45deg, #dc3545, #c82333);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(220, 53, 69, 0.3);
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

interface App {
  id: number;
  title: string;
  description: string;
  url?: string;
  github_url?: string;
  image_url?: string;
  tech_stack?: string;
  category?: string;
  development_date?: string;
  created_at?: string;
}

interface ProjectManageModalProps {
  apps: App[];
  onClose: () => void;
  onDelete: (ids: number[]) => void;
}

export default function ProjectManageModal({ apps, onClose, onDelete }: ProjectManageModalProps) {
  const [password, setPassword] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentStoredPassword, setCurrentStoredPassword] = useState('deokslife')

  const formatDate = (dateString?: string) => {
    if (!dateString) return '미지정'
    const [year, month] = dateString.split('-')
    return `${year}년 ${parseInt(month)}월`
  }

  // localStorage에서 저장된 비밀번호 불러오기
  useEffect(() => {
    const savedPassword = localStorage.getItem('adminPassword')
    if (savedPassword) {
      setCurrentStoredPassword(savedPassword)
    }
  }, [])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 먼저 localStorage 저장된 비밀번호 확인
    if (password.trim() === currentStoredPassword) {
      setIsAuthenticated(true)
      return
    }

    // localStorage와 다르면 서버의 기본 비밀번호 확인
    try {
      const response = await fetch('/api/password-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.valid) {
          setIsAuthenticated(true)
          // 서버 비밀번호가 맞으면 localStorage에도 저장
          localStorage.setItem('adminPassword', password.trim())
          setCurrentStoredPassword(password.trim())
        } else {
          alert('관리자 비밀번호가 일치하지 않습니다.')
        }
      } else {
        alert('관리자 비밀번호가 일치하지 않습니다.')
      }
    } catch (error) {
      alert('비밀번호 확인 중 오류가 발생했습니다.')
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword.length < 4) {
      alert('새 비밀번호는 최소 4자 이상이어야 합니다.')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    try {
      // 서버에 비밀번호 변경 요청
      const response = await fetch('/api/admin-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: currentStoredPassword, 
          newPassword: newPassword 
        })
      })

      if (response.ok) {
        // 성공하면 localStorage에도 새 비밀번호 저장
        localStorage.setItem('adminPassword', newPassword)
        setCurrentStoredPassword(newPassword)
        
        alert('비밀번호가 성공적으로 변경되었습니다.')
        setShowPasswordChange(false)
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const errorData = await response.json()
        alert(errorData.error || '비밀번호 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error)
      alert('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(apps.map(app => app.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectProject = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
    }
  }

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      alert('삭제할 프로젝트를 선택해주세요.')
      return
    }

    const confirmMessage = `선택한 ${selectedIds.length}개의 프로젝트를 정말 삭제하시겠습니까?`
    if (!confirm(confirmMessage)) {
      return
    }

    setLoading(true)
    try {
      await onDelete(selectedIds)
      setSelectedIds([])
    } catch (error) {
      console.error('삭제 중 오류 발생:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const isAllSelected = apps.length > 0 && selectedIds.length === apps.length

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer>
        <Title>프로젝트 관리</Title>
        
        {!isAuthenticated ? (
          <form onSubmit={handlePasswordSubmit}>
            <PasswordSection>
              <Label htmlFor="admin_password">관리자 비밀번호</Label>
              <Input
                type="password"
                id="admin_password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="관리자 비밀번호를 입력하세요"
                required
                autoFocus
              />
            </PasswordSection>
            <Actions>
              <Button type="button" className="secondary" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" className="primary">
                확인
              </Button>
            </Actions>
          </form>
        ) : (
          <>
            <ProjectList>
              <SelectAllSection>
                <Checkbox
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span>전체 선택</span>
              </SelectAllSection>
              
              {apps.map(app => (
                <ProjectItem
                  key={app.id}
                  isSelected={selectedIds.includes(app.id)}
                >
                  <Checkbox
                    type="checkbox"
                    checked={selectedIds.includes(app.id)}
                    onChange={(e) => handleSelectProject(app.id, e.target.checked)}
                  />
                  <ProjectInfo>
                    <ProjectTitle>{app.title}</ProjectTitle>
                    <ProjectMeta>
                      <ProjectDate>{formatDate(app.development_date)}</ProjectDate>
                      <ProjectCategory>{app.category || '웹 프로젝트'}</ProjectCategory>
                    </ProjectMeta>
                  </ProjectInfo>
                </ProjectItem>
              ))}
            </ProjectList>

            <SelectedCount>
              선택된 프로젝트: <span className="count">{selectedIds.length}</span>개
            </SelectedCount>

            <Actions>
              <Button 
                type="button" 
                className="secondary" 
                onClick={() => setShowPasswordChange(!showPasswordChange)}
              >
                비밀번호 변경
              </Button>
              <Button type="button" className="secondary" onClick={onClose}>
                닫기
              </Button>
              <Button
                type="button"
                className="primary"
                onClick={handleDelete}
                disabled={selectedIds.length === 0 || loading}
              >
                {loading ? '삭제 중...' : `선택 항목 삭제 (${selectedIds.length})`}
              </Button>
            </Actions>

            {showPasswordChange && (
              <form onSubmit={handlePasswordChange} style={{ marginTop: '2rem' }}>
                <PasswordSection>
                  <Label htmlFor="new_password">새 비밀번호</Label>
                  <Input
                    type="password"
                    id="new_password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호 (최소 4자)"
                    required
                    minLength={4}
                  />
                  <Label htmlFor="confirm_password" style={{ marginTop: '1rem' }}>비밀번호 확인</Label>
                  <Input
                    type="password"
                    id="confirm_password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="새 비밀번호 다시 입력"
                    required
                  />
                </PasswordSection>
                <Actions>
                  <Button 
                    type="button" 
                    className="secondary" 
                    onClick={() => {
                      setShowPasswordChange(false)
                      setNewPassword('')
                      setConfirmPassword('')
                    }}
                  >
                    취소
                  </Button>
                  <Button type="submit" className="primary">
                    비밀번호 변경
                  </Button>
                </Actions>
              </form>
            )}
          </>
        )}
      </ModalContainer>
    </Overlay>
  )
}