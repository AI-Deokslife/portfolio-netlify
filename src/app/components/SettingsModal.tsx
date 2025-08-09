'use client'
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
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
`

const Stats = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  .count {
    font-size: 3rem;
    font-weight: bold;
    color: #667eea;
  }
  
  .label {
    color: #666;
    font-size: 1.1rem;
    margin-top: 0.5rem;
  }
`

const Button = styled.button`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #dee2e6;
  border-radius: 10px;
  background: #f8f9fa;
  color: #495057;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: #e9ecef;
  }
`

interface SettingsModalProps {
  appCount: number;
  onClose: () => void;
}

export default function SettingsModal({ appCount, onClose }: SettingsModalProps) {
  const handleOverlayClick = (e: React.MouseEvent) => {
    // 드래그 중이거나 텍스트 선택이 있으면 모달을 닫지 않음
    const selection = window.getSelection()
    if (e.target === e.currentTarget && (!selection || !selection.toString())) {
      onClose()
    }
  }

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <Title>⚙️ 설정</Title>
        
        <Stats>
          <div className="count">{appCount}</div>
          <div className="label">등록된 프로젝트</div>
        </Stats>

        <Button onClick={onClose}>
          닫기
        </Button>
      </Modal>
    </Overlay>
  )
}