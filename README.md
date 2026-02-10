# 김치프리미엄 대시보드 (Kimchi Premium Dashboard)

실시간 암호화폐 김치프리미엄 모니터링 및 백테스팅 도구입니다. Supabase와 Next.js 14를 기반으로 구축되었습니다.

## 주요 기능

1. **실시간 대시보드**:
    - 현재 김치프리미엄, 기간 내 최고/최저 프리미엄 조회
    - 1분, 1시간, 4시간, 1일 단위 차트 제공 (KST 기준)
    - 요일 및 시간대별 프리미엄 강도 히트맵 (30분/60분 단위)
    - 10초 자동 새로고침(Polling) 지원
2. **백테스팅 시뮬레이터**:
    - 진입/탈출 스프레드 설정에 따른 과거 수익률 시뮬레이션
    - 승률, 거래 횟수, 총 수익률 계산

## 기술 스택 (Tech Stack)

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **Visualization**: Recharts
- **UI Components**: Custom Components (Mental Model of shadcn/ui)

## 설치 및 실행 방법

### 1. 프로젝트 클론

```bash
git clone https://github.com/YOUR_USERNAME/kimchi-premium.git
cd kimchi-premium
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 Supabase 정보를 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 데이터베이스 설정 (필수)

Supabase SQL Editor에서 `/supabase/rpc.sql` 파일의 내용을 실행하여 필요한 RPC 함수를 생성해야 합니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.

## 배포 (Vercel)

1. GitHub 저장소에 코드를 푸시합니다.
2. Vercel에서 'New Project'를 클릭하고 해당 저장소를 import 합니다.
3. Environment Variables 설정 메뉴에서 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 추가합니다.
4. Deploy 버튼을 누르면 배포가 완료됩니다.
