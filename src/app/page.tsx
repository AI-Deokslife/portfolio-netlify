'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import Header from './components/Header'
import AppCard from './components/AppCard'
import AppForm from './components/AppForm'
import AdminPasswordModal from './components/AdminPasswordModal'
import SettingsModal from './components/SettingsModal'
import SkillsEditModal from './components/SkillsEditModal'
import ProjectManageModal from './components/ProjectManageModal'
import { getStoredPassword } from './utils/passwordUtils'

const Container = styled.div`
  min-height: 100vh;
  background: #ffffff;
`

// About Me Section (흰색)
const AboutSection = styled.section`
  background: #ffffff;
  padding: 4rem 0;
  border-bottom: 1px solid #e9ecef;
`

// Skills Section (노란색)
const SkillsSection = styled.section`
  background: #f9c51d;
  padding: 4rem 0;
  position: relative;
`

// Projects Section (회색)
const ProjectsSection = styled.section`
  background: #e9ecef;
  padding: 4rem 0;
  min-height: 60vh;
`

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  color: #2c3e50;
  
  &::before {
    content: '🔗';
    position: absolute;
    left: -3rem;
    top: 0;
    font-size: 2rem;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
    
    &::before {
      left: -2.5rem;
      font-size: 1.5rem;
    }
  }
`

const AboutContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`

const AboutItem = styled.div`
  padding: 1.5rem;
  
  .icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    display: block;
  }
  
  .label {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
  
  .value {
    color: #6c757d;
    font-size: 0.9rem;
  }
`

const SkillsContent = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 2rem;
  margin: 0 auto;
  max-width: 800px;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`

const EditSkillsButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  color: #6c757d;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    border-color: #dee2e6;
    transform: translateY(-1px);
  }
`

const SkillCategory = styled.div`
  margin-bottom: 2rem;
  
  .category-title {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`

const SkillTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const SkillTag = styled.span`
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
  
  &.frontend { background: #007bff; }
  &.backend { background: #28a745; }
  &.database { background: #6f42c1; }
  &.tools { background: #fd7e14; }
`

const AppsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  @media (max-width: 1024px) and (min-width: 769px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const AddButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #dc3545;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(220, 53, 69, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #c82333;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
  }
`

const ManageButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 5rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #6c757d;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(108, 117, 125, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #5a6268;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 6rem 2rem;
  color: #7f8c8d;
  background: white;
  border-radius: 12px;
  margin: 2rem 0;

  h2 {
    margin-bottom: 1rem;
    font-size: 2rem;
    color: #2c3e50;
    font-weight: 600;
  }

  p {
    font-size: 1.1rem;
    max-width: 400px;
    margin: 0 auto;
  }
`

const PaginationContainer = styled.div`
  margin-top: 3rem;
  text-align: center;
`

const PaginationInfo = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
`

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const PageButton = styled.button`
  padding: 0.6rem 1rem;
  border: 2px solid #dee2e6;
  background: white;
  color: #6c757d;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  min-width: 44px;

  &:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #adb5bd;
    transform: translateY(-1px);
  }

  &.active {
    background: #dc3545;
    color: white;
    border-color: #dc3545;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      background: white;
      border-color: #dee2e6;
    }
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
    min-width: 40px;
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
}

export default function HomePage() {
  const [apps, setApps] = useState<App[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingApp, setEditingApp] = useState<App | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [deleteAppId, setDeleteAppId] = useState<number | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSkillsEdit, setShowSkillsEdit] = useState(false)
  const [skillsLoading, setSkillsLoading] = useState(false)
  const [showProjectManage, setShowProjectManage] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [skills, setSkills] = useState({
    frontend: ['React', 'Vue.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
    backend: ['Node.js', 'Express', 'Python', 'Django'],
    database: ['MySQL', 'PostgreSQL', 'MongoDB', 'Supabase'],
    tools: ['Git', 'Docker', 'Figma', 'VS Code']
  })
  
  const ITEMS_PER_PAGE = 6

  // 앱 목록 불러오기
  const fetchApps = async () => {
    try {
      const response = await fetch('/api/apps')
      if (response.ok) {
        const data = await response.json()
        setApps(data)
      }
    } catch (error) {
      console.error('앱 목록을 불러오는데 실패했습니다:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [])

  const handleAddApp = () => {
    setEditingApp(null)
    setShowForm(true)
  }

  const handleEditApp = (app: App) => {
    setEditingApp(app)
    setShowForm(true)
  }

  const handleDeleteApp = (id: number) => {
    setDeleteAppId(id)
    setShowPasswordModal(true)
  }

  const confirmDelete = async (password: string) => {
    setModalLoading(true)
    try {
      const storedPassword = getStoredPassword()
      let response: Response
      
      // 1. localStorage 비밀번호로 먼저 시도
      response = await fetch(`/api/apps/${deleteAppId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_password: storedPassword })
      })

      // 2. 실패하면 사용자 입력 비밀번호로 시도
      if (!response.ok && password && password !== storedPassword) {
        response = await fetch(`/api/apps/${deleteAppId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ admin_password: password })
        })
        
        // 사용자 입력으로 성공하면 localStorage에도 저장
        if (response.ok) {
          localStorage.setItem('adminPassword', password)
        }
      }

      if (response.ok) {
        fetchApps()
        setShowPasswordModal(false)
        setDeleteAppId(null)
      } else {
        const data = await response.json()
        alert(data.error || '삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('앱 삭제에 실패했습니다:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setModalLoading(false)
    }
  }

  const cancelDelete = () => {
    setShowPasswordModal(false)
    setDeleteAppId(null)
    setModalLoading(false)
  }

  // 프로젝트 관리 모달 관련
  const handleProjectManage = () => {
    setShowProjectManage(true)
  }

  const handleBulkDelete = async (ids: number[]) => {
    const storedPassword = getStoredPassword()
    const deletePromises = ids.map(id => 
      fetch(`/api/apps/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_password: storedPassword })
      })
    )

    try {
      await Promise.all(deletePromises)
      await fetchApps() // 목록 새로고침
    } catch (error) {
      console.error('일괄 삭제 중 오류:', error)
      alert('일부 항목 삭제에 실패했습니다.')
    }
  }

  const handleFormSubmit = () => {
    setShowForm(false)
    setEditingApp(null)
    fetchApps()
  }

  const handleSkillsEdit = () => {
    setShowSkillsEdit(true)
  }

  const handleSkillsSave = async (newSkills: typeof skills, adminPassword: string) => {
    setSkillsLoading(true)
    try {
      const storedPassword = getStoredPassword()
      
      // 관리자 비밀번호 검증 (localStorage 우선, 그 다음 기본값)
      if (adminPassword.trim() === storedPassword || 
          (storedPassword !== 'deokslife' && adminPassword.trim() === 'deokslife')) {
        
        // 기본 비밀번호로 성공하면 localStorage에 저장
        if (adminPassword.trim() === 'deokslife' && storedPassword !== 'deokslife') {
          localStorage.setItem('adminPassword', adminPassword.trim())
        }
        
        localStorage.setItem('portfolio_skills', JSON.stringify(newSkills))
        setSkills(newSkills)
        setShowSkillsEdit(false)
        alert('스킬이 성공적으로 저장되었습니다!')
      } else {
        alert('관리자 비밀번호가 일치하지 않습니다.')
        return
      }
    } catch (error) {
      console.error('스킬 저장 실패:', error)
      alert('스킬 저장에 실패했습니다.')
    } finally {
      setSkillsLoading(false)
    }
  }

  const cancelSkillsEdit = () => {
    setShowSkillsEdit(false)
    setSkillsLoading(false)
  }

  // Skills 데이터를 localStorage에서 로드
  useEffect(() => {
    const savedSkills = localStorage.getItem('portfolio_skills')
    if (savedSkills) {
      try {
        setSkills(JSON.parse(savedSkills))
      } catch (error) {
        console.error('저장된 스킬 데이터 로드 실패:', error)
      }
    }
  }, [])

  // 페이지네이션 관련 계산
  const totalPages = Math.ceil(apps.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentApps = apps.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // 페이지 변경 시 프로젝트 섹션으로 스크롤
    const projectsSection = document.getElementById('projects-section')
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <Container>
        <EmptyState>
          <h2>로딩 중...</h2>
        </EmptyState>
      </Container>
    )
  }

  return (
    <Container>
      {/* Header */}
      <Header 
        appCount={apps.length}
      />
      
      {/* About Me Section */}
      <AboutSection>
        <Main>
          <SectionTitle>ABOUT ME</SectionTitle>
          <AboutContent>
            <AboutItem>
              <span className="icon">👤</span>
              <div className="label">이름</div>
              <div className="value">이은덕</div>
            </AboutItem>
            <AboutItem>
              <span className="icon">📧</span>
              <div className="label">이메일</div>
              <div className="value">deokslife@naver.com</div>
            </AboutItem>
            <AboutItem>
              <span className="icon">📍</span>
              <div className="label">위치</div>
              <div className="value">대한민국, 서울</div>
            </AboutItem>
            <AboutItem>
              <span className="icon">✏️</span>
              <div className="label">전문분야</div>
              <div className="value">웹 개발 및 프론트엔드</div>
            </AboutItem>
          </AboutContent>
        </Main>
      </AboutSection>

      {/* Skills Section */}
      <SkillsSection>
        <Main>
          <SectionTitle>SKILLS</SectionTitle>
          <SkillsContent>
            <EditSkillsButton onClick={handleSkillsEdit}>
              ✏️ 편집
            </EditSkillsButton>
            
            <SkillCategory>
              <div className="category-title">
                <span>💻</span> Frontend
              </div>
              <SkillTags>
                {skills.frontend.map((skill, index) => (
                  <SkillTag key={index} className="frontend">{skill}</SkillTag>
                ))}
              </SkillTags>
            </SkillCategory>
            
            <SkillCategory>
              <div className="category-title">
                <span>⚙️</span> Backend
              </div>
              <SkillTags>
                {skills.backend.map((skill, index) => (
                  <SkillTag key={index} className="backend">{skill}</SkillTag>
                ))}
              </SkillTags>
            </SkillCategory>

            <SkillCategory>
              <div className="category-title">
                <span>🗄️</span> Database
              </div>
              <SkillTags>
                {skills.database.map((skill, index) => (
                  <SkillTag key={index} className="database">{skill}</SkillTag>
                ))}
              </SkillTags>
            </SkillCategory>

            <SkillCategory>
              <div className="category-title">
                <span>🛠️</span> Tools
              </div>
              <SkillTags>
                {skills.tools.map((skill, index) => (
                  <SkillTag key={index} className="tools">{skill}</SkillTag>
                ))}
              </SkillTags>
            </SkillCategory>
          </SkillsContent>
        </Main>
      </SkillsSection>
      
      {/* Projects Section */}
      <ProjectsSection id="projects-section">
        <Main>
          <SectionTitle>PROJECTS</SectionTitle>
          {apps.length === 0 ? (
            <EmptyState>
              <h2>아직 등록된 웹앱이 없습니다</h2>
              <p>+ 버튼을 클릭해서 첫 번째 웹앱을 추가해보세요!</p>
            </EmptyState>
          ) : (
            <>
              <AppsGrid>
                {currentApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onEdit={handleEditApp}
                    onDelete={handleDeleteApp}
                  />
                ))}
              </AppsGrid>
              
              {totalPages > 1 && (
                <PaginationContainer>
                  <PaginationInfo>
                    {apps.length}개 프로젝트 중 {startIndex + 1}-{Math.min(endIndex, apps.length)}번째
                  </PaginationInfo>
                  <Pagination>
                    <PageButton
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ‹ 이전
                    </PageButton>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PageButton
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={currentPage === page ? 'active' : ''}
                      >
                        {page}
                      </PageButton>
                    ))}
                    
                    <PageButton
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      다음 ›
                    </PageButton>
                  </Pagination>
                </PaginationContainer>
              )}
            </>
          )}
        </Main>
      </ProjectsSection>
      
      <ManageButton onClick={handleProjectManage}>🗂️</ManageButton>
      <AddButton onClick={handleAddApp}>+</AddButton>
      
      {showForm && (
        <AppForm
          app={editingApp}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {showPasswordModal && (
        <AdminPasswordModal
          title="앱 삭제"
          message="이 앱을 삭제하려면 관리자 비밀번호를 입력하세요."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          loading={modalLoading}
        />
      )}

      {showSettings && (
        <SettingsModal
          appCount={apps.length}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showSkillsEdit && (
        <SkillsEditModal
          skills={skills}
          onSave={handleSkillsSave}
          onCancel={cancelSkillsEdit}
          loading={skillsLoading}
        />
      )}

      {showProjectManage && (
        <ProjectManageModal
          apps={apps}
          onClose={() => setShowProjectManage(false)}
          onDelete={handleBulkDelete}
        />
      )}
    </Container>
  )
}