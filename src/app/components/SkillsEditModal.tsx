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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
`

const Category = styled.div`
  margin-bottom: 1.5rem;
`

const CategoryTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: #2c3e50;
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-family: inherit;
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
`

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`

const Button = styled.button`
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;

  &.primary {
    background: #4ECDC4;
    color: white;
  }

  &.secondary {
    background: #f8f9fa;
    color: #495057;
    border: 2px solid #dee2e6;
  }
`

interface Skills {
  frontend: string[];
  backend: string[];
  database: string[];
  tools: string[];
}

interface SkillsEditModalProps {
  skills: Skills;
  onSave: (skills: Skills, adminPassword: string) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function SkillsEditModal({ skills, onSave, onCancel, loading }: SkillsEditModalProps) {
  const [editedSkills, setEditedSkills] = useState({
    frontend: skills.frontend.join(', '),
    backend: skills.backend.join(', '),
    database: skills.database.join(', '),
    tools: skills.tools.join(', ')
  })
  const [adminPassword, setAdminPassword] = useState('')

  const handleChange = (category: string, value: string) => {
    setEditedSkills(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const handleSave = () => {
    if (!adminPassword.trim()) {
      alert('관리자 비밀번호를 입력해주세요.')
      return
    }

    const newSkills = {
      frontend: editedSkills.frontend.split(',').map(s => s.trim()).filter(Boolean),
      backend: editedSkills.backend.split(',').map(s => s.trim()).filter(Boolean),
      database: editedSkills.database.split(',').map(s => s.trim()).filter(Boolean),
      tools: editedSkills.tools.split(',').map(s => s.trim()).filter(Boolean)
    }
    onSave(newSkills, adminPassword)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    // 드래그 중이거나 텍스트 선택이 있으면 모달을 닫지 않음
    const selection = window.getSelection()
    if (e.target === e.currentTarget && (!selection || !selection.toString())) {
      onCancel()
    }
  }

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <Title>✏️ 스킬 편집</Title>
        
        <FormGroup>
          <Label htmlFor="admin_password">관리자 비밀번호 *</Label>
          <Input
            type="password"
            id="admin_password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
            placeholder="관리자 비밀번호를 입력하세요"
          />
        </FormGroup>

        <Category>
          <CategoryTitle>💻 Frontend</CategoryTitle>
          <TextArea
            value={editedSkills.frontend}
            onChange={(e) => handleChange('frontend', e.target.value)}
            placeholder="React, Vue.js, JavaScript (쉼표로 구분)"
          />
        </Category>

        <Category>
          <CategoryTitle>⚙️ Backend</CategoryTitle>
          <TextArea
            value={editedSkills.backend}
            onChange={(e) => handleChange('backend', e.target.value)}
            placeholder="Node.js, Express, Python (쉼표로 구분)"
          />
        </Category>

        <Category>
          <CategoryTitle>🗄️ Database</CategoryTitle>
          <TextArea
            value={editedSkills.database}
            onChange={(e) => handleChange('database', e.target.value)}
            placeholder="MySQL, PostgreSQL, MongoDB (쉼표로 구분)"
          />
        </Category>

        <Category>
          <CategoryTitle>🛠️ Tools</CategoryTitle>
          <TextArea
            value={editedSkills.tools}
            onChange={(e) => handleChange('tools', e.target.value)}
            placeholder="Git, Docker, Figma (쉼표로 구분)"
          />
        </Category>

        <Actions>
          <Button type="button" className="secondary" onClick={onCancel}>
            취소
          </Button>
          <Button type="button" className="primary" onClick={handleSave} disabled={loading}>
            {loading ? '저장중...' : '저장'}
          </Button>
        </Actions>
      </Modal>
    </Overlay>
  )
}