# SmartOffice — 관리자 웹 (SmartOffice-web)

> SaaS 형 스마트 오피스 통합 관리 플랫폼의 **관리자(Admin) 전용 웹 클라이언트**.
> 동의대학교 컴퓨터공학과 캡스톤 디자인 — 팀 그로운 (2026.03 ~ 2026.06).

본 레포는 백엔드(`SmartOffice-server`) 의 ADMIN 권한 엔드포인트를 호출하여 전사 직원·부서·자산·급여·출입·구역·장치·전력·예약·NFC 카드를 운영하는 단일 페이지 애플리케이션이다. 일반 직원용 화면은 `SmartOffice-app` (Flutter) 에서 담당하므로 본 클라이언트에는 USER 권한 기능이 노출되지 않는다.

---

## 기술 스택

- **언어/런타임**: TypeScript 5.8 · React 19 · Node 22
- **빌드**: Vite 6 · esbuild (`server.ts` 번들, 시연 정적 서버 + `/api/v1` 프록시)
- **스타일**: Tailwind CSS v4 · shadcn UI · Base UI · motion
- **서버 상태**: TanStack Query v5 (도메인 폴더의 `queryKeys.ts` factory)
- **클라이언트 상태**: Zustand (`authStore` · `uiStore` 만)
- **라우팅**: React Router v7 (Data Router 모드 미사용)
- **HTTP**: axios (`src/lib/api/client.ts`) — Authorization Bearer 자동 첨부, ApiResponse 자동 언래핑, 401 시 refresh 1회 시도
- **테스트**: Vitest + React Testing Library + MSW (Node 서버 모드, 테스트 환경 전용)
- **린트/포맷**: ESLint 9 flat config + Prettier 3

---

## 백엔드 연동

- 백엔드 레포: `../SmartOffice-server` (Spring Boot 4.0.5 · MySQL 8 · Redis 7 · MQTT)
- 모든 호출 경로: `/api/v1/{resource}` — `ApiResponse<T> { code, message, data }` 래퍼
- 인증: JWT (Access 30분 / Refresh 7일). 본 클라이언트는 ADMIN 토큰만 허용 (USER 토큰 로그인 차단 — `LoginPage.tsx`).
- API 명세: `../SmartOffice-docs/api-spec/` 도메인별 md 파일.

---

## 개발·시연 실행

### 1. 개발 모드 (Vite dev 서버 + 백엔드 직결)

```bash
# 백엔드 먼저 기동
cd ../SmartOffice-server && ./gradlew bootRun

# 프론트 dev 서버
cd ../SmartOffice-web && npm install
npm run dev
# → http://localhost:5173
# /api/v1/* 요청은 Vite proxy 가 http://localhost:8080 으로 포워딩 (vite.config.ts)
```

### 2. 시연 빌드 (정적 + 프록시 Node 서버)

```bash
# Linux/macOS
npm run build        # vite build + esbuild server.ts → dist/server.cjs
API_TARGET=http://localhost:8080 npm run start
# → http://localhost:3000 (server.ts 가 정적 SPA 서빙 + /api/v1 프록시)
```

```powershell
# Windows PowerShell (npm run build 는 위와 동일)
$env:API_TARGET="http://localhost:8080"; npm run start
```

### 환경 변수

| 변수 | 기본값 | 사용처 |
|------|--------|--------|
| `VITE_API_URL` | (dev 미사용 — Vite proxy) | prod 빌드 시 axios baseURL. `.env.development` / `.env.production` 분기 |
| `API_TARGET` | `http://localhost:8080` | `server.ts` 시연 모드 `/api/v1` 프록시 대상 |

---

## 디렉터리 구조 (요약)

```
src/
  features/                       # 도메인별 폴더 (16종)
    auth · user · department · attendance · accesslog
    zone · device · dashboard · power · sensor · control
    salary · asset · parking · reservation · nfccard
      ├ types.ts        # 백엔드 DTO 1:1 영문 매핑
      ├ api.ts          # apiClient 호출 함수 집합
      ├ queryKeys.ts    # queryKey factory
      └ hooks.ts        # useXxxQuery / useXxxMutation
  components/
    auth/LoginPage.tsx
    common/{ErrorBoundary, ZoneSelect, ...}.tsx
    dashboard/                    # 페이지 컨테이너
    personnel/ zone/ parking/ building/ meetingroom/ nfccard/
  lib/api/                        # axios 클라이언트 + tokenStorage + 에러 유틸
  routes/                         # paths.ts (ROUTES/TAB_TO_PATH) + guards.tsx
  stores/                         # Zustand (auth · ui)
  test/handlers/                  # MSW 핸들러 (테스트 전용)
```

상세 컨벤션·아키텍처는 `CLAUDE.md` 참조.

---

## 사이드바 메뉴 (관리자 운영 화면 10종)

통합 관제 · 인사 관리 · 출입 기록 관리 · 구역 관리 · 회의실 관리 · NFC 카드 관리 · 급여 관리 · 건물 관리 · 재고 관리 · 주차 관리

---

## 명령어 요약

```bash
npm run dev              # Vite dev 서버
npm run build            # prod 빌드 (vite + esbuild)
npm run start            # 시연 정적 서버 + /api/v1 프록시
npm run lint             # tsc --noEmit + eslint
npm run format           # prettier --write
npm test                 # vitest run
npm run test:watch       # vitest watch
npm run test:coverage    # 커버리지
```

---

## 잔존 결함 / 백엔드 개선 제안

본 통합 작업 종료 시점(2026-05-15) 의 잔존 결함과 백엔드 측 보완 제안은 별도 문서에 영구 보존된다.

- **web 측 잔존 결함 추적표 (#1~#10)**: `docs/PLAN_3_MASTER.md` 9절
- **백엔드 개선 제안 (#7~#16, 총 16 항목)**: `../SmartOffice-server/BACKEND_SUGGESTIONS.md`

후속 백엔드 수정 플랜에서 위 두 문서를 입력으로 사용한다.

---

## 문서 동기화 규칙

- `CLAUDE.md` · `AGENTS.md` · `GEMINI.md` 3종 본문 동일 유지 (갱신 시 같은 변경에 함께 반영).
- 상위 `10-Capstone/{CLAUDE,AGENTS,GEMINI}.md` (멀티 레포 메타) 와는 별개의 동기화 그룹이다.

---

_본 문서 일자: 2026-05-15_
