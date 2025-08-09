-- =============================================
-- 포트폴리오 프로젝트 Supabase 통합 설정 스크립트
-- =============================================
-- 이 스크립트는 기존 데이터를 보존하면서 필요한 테이블과 Storage를 설정합니다.

-- 1. admin_settings 테이블 생성 (관리자 비밀번호 저장용)
-- =======================================================
CREATE TABLE IF NOT EXISTS admin_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 관리자 비밀번호 설정 (존재하지 않을 때만)
INSERT INTO admin_settings (setting_key, setting_value)
VALUES ('admin_password', 'deokslife')
ON CONFLICT (setting_key) DO NOTHING;

-- 2. apps 테이블에 새 컬럼 추가
-- ================================
-- 기존 데이터 보존하면서 새 컬럼들 추가
ALTER TABLE apps ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '웹 프로젝트';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS development_date TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS download_url TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS download_filename TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS download_filesize BIGINT;

-- 3. Storage 버킷 설정
-- ===================
-- project-images 버킷 (이미 존재할 수 있음)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'project-images', 
    'project-images', 
    true, 
    5242880,  -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- project-files 버킷 (새로 추가되는 파일용)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
    'project-files', 
    'project-files', 
    true, 
    52428800  -- 50MB
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800;

-- 4. Storage RLS 정책 정리 및 설정
-- ===============================
-- 기존 충돌 가능한 정책들 제거
DROP POLICY IF EXISTS "Enable insert for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable read for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for all users" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;

-- project-images 버킷 정책
CREATE POLICY "project_images_read" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-images');

CREATE POLICY "project_images_write" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "project_images_update" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'project-images');

CREATE POLICY "project_images_delete" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'project-images');

-- project-files 버킷 정책
CREATE POLICY "project_files_read" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-files');

CREATE POLICY "project_files_write" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'project-files');

CREATE POLICY "project_files_update" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'project-files');

CREATE POLICY "project_files_delete" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'project-files');

-- 5. 확인 쿼리들
-- ==============
-- 설정이 제대로 되었는지 확인할 수 있는 쿼리들

-- admin_settings 테이블 확인
-- SELECT * FROM admin_settings;

-- apps 테이블 구조 확인 (새 컬럼들 포함)
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'apps' 
-- ORDER BY ordinal_position;

-- Storage 버킷 확인
-- SELECT id, name, public, file_size_limit, allowed_mime_types, created_at 
-- FROM storage.buckets 
-- WHERE name IN ('project-images', 'project-files');

-- Storage 정책 확인
-- SELECT policyname, cmd, bucket_id
-- FROM (
--     SELECT policyname, cmd, 
--            CASE 
--                WHEN policyname LIKE '%project_images%' THEN 'project-images'
--                WHEN policyname LIKE '%project_files%' THEN 'project-files'
--                ELSE 'other'
--            END as bucket_id
--     FROM pg_policies 
--     WHERE tablename = 'objects' AND schemaname = 'storage'
-- ) policies
-- WHERE bucket_id IN ('project-images', 'project-files')
-- ORDER BY bucket_id, cmd;

-- =============================================
-- 설정 완료!
-- =============================================
-- 이 스크립트 실행 후:
-- 1. admin_settings 테이블이 생성되고 기본 비밀번호가 설정됩니다
-- 2. apps 테이블에 새 컬럼들이 추가됩니다 (기존 데이터 보존)
-- 3. Storage 버킷들이 설정되고 적절한 정책들이 적용됩니다
-- 4. 파일 업로드/다운로드 기능이 정상 작동합니다

SELECT 'Supabase 포트폴리오 프로젝트 설정이 완료되었습니다!' AS setup_status;