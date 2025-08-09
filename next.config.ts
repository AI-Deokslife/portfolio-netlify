import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint 설정 오류를 우회하기 위해 빌드 중 ESLint 검사 비활성화
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 타입 체크 오류 시에도 빌드 계속
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
