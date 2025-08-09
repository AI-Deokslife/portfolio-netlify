# Portfolio - Netlify 배포용

이 프로젝트는 Netlify 배포를 위한 Next.js 15 포트폴리오 웹사이트입니다.

## 🚀 배포 방법

### Option 1: GitHub 연동 (권장)
1. 이 폴더를 새로운 GitHub 저장소로 푸시
2. Netlify 대시보드 → "New site from Git"
3. GitHub 저장소 선택
4. Build settings는 자동으로 `netlify.toml`에서 읽어옵니다

### Option 2: 수동 배포
```bash
npm install -g netlify-cli
cd portfolio-netlify
npm install
npm run build
netlify deploy --prod --dir=.next
```

## ⚙️ 환경 변수 설정

Netlify 대시보드 → Site settings → Environment variables에서 추가:

```
NEXT_PUBLIC_SUPABASE_URL=https://dmeipyonfxlgufnanewn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtZWlweW9uZnhsZ3VmbmFuZXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTI2NDksImV4cCI6MjA3MDEyODY0OX0.aI7PQe6PVQGJQ_M3hMMbKUpC1g_gSewTvJLI_NtIDMI
```

## 📋 주요 특징

- ✅ Next.js 15 with App Router
- ✅ Styled Components
- ✅ Supabase 연동
- ✅ 반응형 디자인
- ✅ API Routes (Netlify Functions로 자동 변환)

## 🔧 로컬 개발

```bash
npm install
npm run dev
```

http://localhost:3000에서 확인

## 📁 프로젝트 구조

```
portfolio-netlify/
├── src/
│   └── app/
│       ├── api/          # API Routes (Netlify Functions)
│       ├── components/   # React 컴포넌트
│       └── page.tsx     # 메인 페이지
├── public/              # 정적 파일
├── netlify.toml        # Netlify 설정
└── package.json
```

## ⚠️ 주의사항

- API Routes는 Netlify Functions으로 변환되어 10초 실행 시간 제한이 있습니다
- 첫 방문 시 Cold Start로 인해 약간의 지연이 있을 수 있습니다