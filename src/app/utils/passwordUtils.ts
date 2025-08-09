// 관리자 비밀번호 관련 유틸리티 함수들

export const getStoredPassword = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminPassword') || 'deokslife'
  }
  return 'deokslife' // 서버사이드에서는 기본값 사용
}

export const setStoredPassword = (newPassword: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminPassword', newPassword)
  }
}

export const validatePassword = (inputPassword: string): boolean => {
  const storedPassword = getStoredPassword()
  return inputPassword.trim() === storedPassword
}

// API 요청 시 올바른 비밀번호로 시도하는 헬퍼 함수
export const makeAuthenticatedRequest = async (
  url: string, 
  method: string, 
  data: any,
  userInputPassword?: string
): Promise<Response> => {
  const storedPassword = getStoredPassword()
  
  // 1. 먼저 사용자가 입력한 비밀번호가 있으면 그것을 사용
  if (userInputPassword) {
    const requestData = { ...data, admin_password: userInputPassword }
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    })
    
    if (response.ok) {
      // 성공하면 localStorage에도 저장 (서버 기본 비밀번호인 경우)
      if (userInputPassword !== storedPassword) {
        setStoredPassword(userInputPassword)
      }
      return response
    }
  }
  
  // 2. localStorage에 저장된 비밀번호로 시도
  const requestWithStoredPassword = { ...data, admin_password: storedPassword }
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestWithStoredPassword)
  })
  
  if (response.ok) {
    return response
  }
  
  // 3. 저장된 비밀번호가 기본값이 아니라면, 기본값도 시도
  if (storedPassword !== 'deokslife') {
    const requestWithDefaultPassword = { ...data, admin_password: 'deokslife' }
    const defaultResponse = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestWithDefaultPassword)
    })
    
    if (defaultResponse.ok) {
      // 기본 비밀번호로 성공하면 localStorage 업데이트
      setStoredPassword('deokslife')
      return defaultResponse
    }
  }
  
  return response // 마지막 실패한 응답 반환
}