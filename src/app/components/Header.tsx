'use client'
import styled from 'styled-components'

const HeaderContainer = styled.header`
  background: #8b5cf6;
  color: white;
  padding: 1rem 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    z-index: 0;
  }
`

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
`

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const Title = styled.h1`
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`

const Stats = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const StatItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
  color: white;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`

interface HeaderProps {
  appCount: number;
}

export default function Header({ appCount = 0 }: HeaderProps) {
  return (
    <HeaderContainer>
      <HeaderContent>
        <Brand>
          <Title>EunDeok&apos;s AI Vibe Coding Portfolio</Title>
        </Brand>
        <Stats>
          <StatItem>
            프로젝트 {appCount}개
          </StatItem>
        </Stats>
      </HeaderContent>
    </HeaderContainer>
  )
}
