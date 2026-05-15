# CLAUDE.md — SmartOffice Frontend

> 본 파일과 `AGENTS.md`, `GEMINI.md` 는 **동일 내용**을 유지한다. 갱신 시 세 파일을 같은 변경에 함께 반영하라. 백엔드 md 3종(`SmartOffice-server/CLAUDE.md` 등)과는 별개로 동기화한다.

---

## 1. 프로젝트 개요

- **프로젝트명**: SaaS형 스마트 오피스 통합 관리 플랫폼 — 웹 클라이언트
- **팀명**: 그로운 | 동의대학교 컴퓨터공학과 캡스톤 디자인 (2026.03 ~ 2026.06)
- **백엔드**: `../SmartOffice-server` (Spring Boot 4.0.5 · MySQL 8.0 · Redis 7 · MQTT)
- **백엔드 API 경로 prefix**: `/api/v1/{resource}` · 공통 응답 `ApiResponse<T>` 래퍼

## 2. 기술 스택

- **언어/런타임**: TypeScript 5.8 · React 19 · Node 22
- **빌드**: Vite 6 · esbuild (server.ts 번들)
- **스타일**: Tailwind CSS v4 · shadcn UI · Base UI(Radix-like) · motion
- **상태/데이터**:
  - 서버 상태: **TanStack Query v5** (도메인 폴더의 `queryKeys.ts` factory)
  - 클라이언트 상태: **Zustand** (auth, ui 토글만)
- **라우팅**: React Router v7 (Data Router loader/action 미사용 — 데이터 페칭은 Query 가 담당)
- **HTTP**: axios (`src/lib/api/client.ts`) — Authorization Bearer 자동 첨부, ApiResponse 자동 언래핑, 401 시 refresh 1회 시도
- **테스트**: Vitest + React Testing Library + MSW (Node 서버 모드, 테스트 환경 전용)
- **린트/포맷**: ESLint 9 flat config (`eslint.config.js`) + Prettier 3 (`.prettierrc`)

## 3. 디렉터리 구조

```
src/
  App.tsx                       # 인증 후 진입 (Sidebar + TopBar + nested Routes)
  main.tsx                      # ErrorBoundary → QueryProvider → BrowserRouter → 가드/페이지
  index.css                     # OKLCH 디자인 토큰 + @layer components 타이포 토큰
  types.ts                      # 전역 공통 타입(User, TabType 등)

  lib/api/                      # axios 클라이언트 인프라
    client.ts                   # apiClient + apiGet/apiPost/apiPut/apiDelete + 인터셉터
    types.ts                    # ApiResponse<T>, PageResponse<T>, ApiError
    errors.ts                   # ErrorCode → 한국어 메시지 + getErrorMessage
    tokenStorage.ts             # accessToken/refreshToken localStorage 단일 진입점
    __tests__/client.test.ts

  stores/                       # Zustand
    authStore.ts                # { user, login, logout, setUser } - user 만 persist
    uiStore.ts                  # { sidebarCollapsed, theme:"light" 고정 }

  providers/QueryProvider.tsx   # QueryClient (staleTime 60s, gcTime 5m, retry 1) + Devtools(dev)

  routes/
    paths.ts                    # ROUTES 상수 + TAB_TO_PATH / PATH_TO_TAB 매핑
    guards.tsx                  # PrivateRoute / AdminRoute / PublicOnlyRoute

  features/                       # 도메인 18종: auth · user · department · attendance · accesslog · zone · device · dashboard · power · sensor · control · salary · asset · parking · reservation · nfccard · guest · vehicle
    {domain}/
      types.ts                    # 백엔드 DTO 1:1 영문 필드 매핑 (web+모바일 공용 응답도 DTO 1:1)
      api.ts                      # apiClient 호출 함수 집합 (한 함수 = 한 엔드포인트)
      queryKeys.ts                # queryKey factory
      hooks.ts                    # useXxxQuery / useXxxMutation
      __tests__/

  components/
    common/{ErrorBoundary, ZoneSelect, ...}.tsx
    auth/LoginPage.tsx
    dashboard/                    # 페이지 컨테이너 (Sidebar, TopBar, 페이지 상위 컴포넌트 ~150줄)
    personnel/ zone/ parking/ building/ meetingroom/ nfccard/   # 분할된 자식 컴포넌트 (G3·G5·G7·G9·G10·G11)

  hooks/usePaginatedTable.ts

  test/
    setup.ts                    # jest-dom + MSW beforeAll/afterEach/afterAll
    server.ts                   # MSW node 서버
    handlers/                   # 도메인별 MSW 핸들러
    sanity.test.ts

components/ui/                  # shadcn UI 컴포넌트 (root level, alias "@/components/ui/...")
  button.tsx, input.tsx, dialog.tsx, ...
  skeleton.tsx
```

## 4. 파일 네이밍

- 컴포넌트: `PascalCase.tsx` (예: `LoginPage.tsx`, `Sidebar.tsx`)
- 훅: `useXxx.ts(x)` (예: `usePaginatedTable.ts`)
- 유틸·스토어·api: `camelCase.ts` (예: `tokenStorage.ts`, `authStore.ts`)
- 도메인 폴더 내부는 `types.ts / api.ts / queryKeys.ts / hooks.ts` 고정 4 파일을 우선 사용
- 테스트: `*.test.ts(x)` — 대상 파일 옆 또는 `__tests__/` 폴더

## 5. Import 규칙

- alias `@/*` 사용 (tsconfig `paths: { "@/*": ["./*"] }` · root 기준)
- 상대경로 `../` 는 같은 폴더 또는 형제 폴더로 한정 (2단계 이상 X)
- 그룹 순서:
  1. 외부 라이브러리 (`react`, `@tanstack/react-query`, `axios`, …)
  2. 빈 줄
  3. `@/...` 내부 모듈 (alias 사용)
  4. 빈 줄
  5. 같은 디렉터리 상대 import (`./api`, `./types`)
- `import type` 을 가능한 곳에서 사용 (런타임 import 와 분리)

## 6. 주석 언어

- **모든 주석은 한국어로 작성한다.** (변수/함수/타입 식별자는 영어 유지)
- 자명한 코드는 주석을 달지 않는다. 주석은 *왜* 그렇게 작성했는지(제약·근거)에 집중한다.

## 7. 공통 API 래퍼 사용법

```ts
import { apiGet, apiPost } from "@/src/lib/api/client";

// 인터셉터에서 ApiResponse.data 까지 언래핑하므로 res 가 곧 T 다.
const me = await apiGet<MeResponse>("/auth/me");
const result = await apiPost<LoginResponse, LoginRequest>("/auth/login", { email, password });
```

- baseURL: `/api/v1` (dev 는 Vite proxy 가 백엔드 8080 으로 포워딩)
- 인증: `tokenStorage.getAccessToken()` 으로 Authorization Bearer 자동 첨부
- 응답: `code === "success"` 이면 `data` 만 반환, 아니면 `ApiError` throw
- 401: 인터셉터가 `/auth/refresh` 1회 시도. 실패 시 `clearTokens()` + `window.location = "/login"`
- 에러 메시지: 백엔드 응답 `message` 가 1순위(한국어). 없을 때 `getErrorMessage(serverMessage, fallback)` 사용

## 8. TanStack Query 컨벤션

- `QueryClient` 는 `QueryProvider` 에서 1회 생성. 직접 new 하지 말 것.
- `queryKey` 는 도메인 폴더의 `queryKeys.ts` factory 로 정의:

```ts
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};
```

- 도메인 hook 은 `useXxxQuery` / `useXxxMutation` 으로 래핑하여 컴포넌트는 hook 만 사용
- mutation 성공 시 `queryClient.invalidateQueries({ queryKey: xxxKeys.list() })` 로 무효화
- 기본 옵션은 Provider 에 둠: `staleTime: 60_000`, `gcTime: 5 * 60_000`, `retry: 1`, `refetchOnWindowFocus: false`
- v5 부터 `onError` 옵션 제거됨 — 콜백은 `useMutation({ onSuccess, onError })` 또는 `useQuery` 의 `throwOnError` / state 기반 처리

## 9. Zustand 사용 가이드

- 서버 데이터는 절대 store 에 두지 않는다. (TanStack Query 가 담당)
- `useAuthStore`: `{ user, login, logout, setUser }`. 토큰은 store 에 두지 않고 `tokenStorage` 가 보관.
- `useUIStore`: `{ sidebarCollapsed, theme:"light" }`. 다크모드 토글 UI/액션은 본 통합 작업 범위 외.
- 새 도메인을 추가하기 전에 "서버 상태인가, 클라이언트 상태인가" 먼저 분리해라.

## 10. 에러 핸들링

- 라우터 트리 외부의 렌더링 에러: `src/components/common/ErrorBoundary.tsx` (main.tsx 최상단 래핑)
- 비동기/이벤트 에러: `try/catch` 또는 mutation `onError` → `toast.error(...)` (sonner)
- 백엔드 에러 메시지는 한국어로 즉시 표시 가능 (`getErrorMessage(error.serverMessage, fallback)`)

## 11. 라우팅

- `BrowserRouter` 사용. createBrowserRouter 의 Data Router(loader/action) 모드는 사용하지 않음 — 데이터 페칭은 TanStack Query.
- 경로 상수는 `src/routes/paths.ts` 의 `ROUTES` 만 사용. 문자열 하드코딩 금지.
- 가드: `PrivateRoute` / `AdminRoute` / `PublicOnlyRoute` (`src/routes/guards.tsx`)
- 사이드바 메뉴 ↔ 경로 매핑은 `TAB_TO_PATH` 한 곳에서 관리.
- 운영 메뉴(11종): 통합 관제 · 인사 관리 · 출입 기록 관리 · 구역 관리 · 게스트 관리 · 회의실 관리 · NFC 카드 관리 · 급여 관리 · 건물 관리 · 재고 관리 · 주차 관리.

## 12. 테스트 가이드

- 테스트 파일 위치: 컴포넌트 옆 `*.test.tsx` 또는 `__tests__/` 하위
- 통합 테스트는 MSW 핸들러로 백엔드 응답을 모방 (`src/test/handlers/{domain}.ts`)
- 핵심 도메인 통합 테스트 1개 이상 + 인터셉터/유틸 단위 테스트
- 커버리지 목표(가이드라인): 도메인 features 70%+ / 공통 lib 80%+
- 명령어: `npm test` (단발), `npm run test:watch`, `npm run test:coverage`
- jsdom 환경에서 `window.location.href = ...` 는 silent (네비게이션 X) — 테스트는 토큰/state 변화로 검증

## 13. 보안 / 권한

- ADMIN 전용 페이지는 `AdminRoute` 로 감싼다.
- 본인 정보 조회는 표준 엔드포인트로 **`GET /api/v1/auth/me`** 사용. `/users/me` 는 사용하지 않음.
- IoT 전용 엔드포인트(NFC 태그·센서·주차 상태 업데이트)는 프론트에서 호출하지 않음 (장치용 permitAll).
- 토큰: AccessToken은 localStorage 보관. RefreshToken은 백엔드가 httpOnly 쿠키(`Set-Cookie`)로 발급 — axios `withCredentials: true` 로 자동 전송. 401 시 쿠키 우선 refresh 시도 후 localStorage 폴백.

## 14. 백엔드 CLAUDE.md 핵심 규칙 (프론트 적용 분)

- 모든 호출 경로: `/api/v1/{resource}`
- 공통 응답: `ApiResponse<T> { code, errorCode, message, data }` — `code === "success"` 외에는 throw
- 에러 응답: `{ code: "error", message: "한국어" }` — message 를 그대로 사용자에게 노출 가능
- JWT 만료: Access 30분 / Refresh 7일 — refresh 인터셉터 동작 보장 (timeout 8s)
- API 성능 SLO: 95% 500ms 이내 (실측은 백엔드 책임. 프론트는 timeout 8s + 401 자동 refresh)

### 14-1. cat 5 공용 컨벤션 (web + 모바일 공용 엔드포인트)

- 공용 엔드포인트(web 호출 + 모바일 호환) 의 DTO 는 `features/{domain}/types.ts` 에서 백엔드 응답과 **1:1 영문 필드 매핑**.
- 모바일(Flutter)과 코드 공유 X. **계약(요청/응답 타입) 호환만 보장** (OpenAPI 스키마 단일 진실 공급원).
- 추상 hook 인프라 도입 X — 일반 `useQuery` / `useMutation` 직접 호출.
- `api.ts` 는 thin wrapper. 한 함수 = 한 엔드포인트.
- 상세는 `docs/PLAN_3_MASTER.md` 2절 참조.

## 15. 커밋 컨벤션

`feat:` `fix:` `refactor:` `test:` `docs:` `chore:` `style:` `perf:`

- `Co-Authored-By: Claude ...` 푸터 **금지** (전역 규칙)
- `🤖 Generated with [Claude Code]` 등 Claude 생성 표시 **금지**
- 1-line 단위 X, 전체 한 커밋 X — 기능/책임 단위로 끊는다
- 커밋 직전에 `npm run lint && npm run build && npm test` 통과 검증

## 16. 브랜치 / push 정책

- 본 통합 작업 브랜치: `feature/web-integration` → **로컬 `main` 머지 후 origin/main push** (PR 절차 폐기)
- 본 작업 전체에서 **push 는 마지막 1회만** (모든 커밋·문서 동기화 완료 후)

## 17. dev 워크플로우

1. **백엔드 먼저 기동**: `cd ../SmartOffice-server && ./gradlew bootRun` (또는 IDE)
2. **프론트 dev 서버**: `cd SmartOffice-web && npm run dev` → http://localhost:5173
   - `/api/v1/*` 요청은 Vite proxy 가 `localhost:8080` 으로 포워딩 (vite.config.ts)
3. `VITE_API_URL` 은 dev 에서 사용 안 함. **prod 빌드 시에만** 필요 (`.env.example` 참조).
4. MSW 는 **테스트 환경에서만** 활성화. dev MSW 자동 시작은 도입하지 않음 — 백엔드 미기동 시 dev 동작은 보장되지 않는다.

## 18. 다크모드 / i18n

- 본 작업에서는 **CSS Variables(OKLCH) 토큰 구조만 유지**. 다크모드 토글 UI 노출 X.
- `useUIStore.theme` 은 `"light"` 로 고정. 토글 액션은 후속 작업에서 도입.
- i18n 라이브러리는 도입하지 않음. 한국어 텍스트는 컴포넌트 안에 직접 작성.

## 19. md 3종 동기화 규칙

- `CLAUDE.md` · `AGENTS.md` · `GEMINI.md` 세 파일은 **본문 동일**.
- 갱신 시 같은 변경에 세 파일을 함께 반영. 차이가 발생하면 즉시 정합 커밋.
- 백엔드 md 3종(`../SmartOffice-server/CLAUDE.md` 등)과는 별개의 동기화 그룹이다.

## 20. 디자인 시스템 (Tokens v2) — 참고 필수

Claude Design에서 생성한 핸드오프 번들이 **`capstone/`** 폴더에 위치한다.
스타일/레이아웃 작업 시 반드시 이 파일들을 기준으로 삼을 것.

### 핵심 파일

| 파일 | 용도 |
|------|------|
| `capstone/project/tokens-v2-preview.html` | **메인 디자인 기준** — 통합 관제·인사 관리 2개 화면의 완성 프로토타입. 컴포넌트 교체 시 이 파일 CSS/마크업을 1차 참조. |
| `capstone/project/tokens-v2.html` | 대안 A/B/C 비교 원본. A 베이스 + B 일부 차용으로 확정됨. |
| `capstone/project/design-system-audit.html` | 기존 디자인 시스템 감사 리포트. 문제점 목록 참고용. |
| `capstone/project/responsive-review.html` | 반응형 검토 리포트. min-width 960px, 1024px 권장. |
| `capstone/chats/chat2.md` | 디자인 결정 히스토리 전체. 왜 이렇게 결정됐는지 맥락 확인용. |
| `capstone/project/src/index.css` | 디자인 어시스턴트가 작성한 참고 index.css (실제 적용본은 `src/index.css`). |

### 확정 토큰 요약 (Tokens v2 · A 베이스 + B 차용)

- **Primary**: blue 258° (`--primary: oklch(0.555 0.180 258)`)
- **Surface 3단**: `--canvas` (near-white) / `--surface` (pure white) / `--surface-2` (중간)
- **Semantic 4쌍**: `success` / `warning` / `info` / `error` × (`base` · `bg` · `fg`)
- **Chart 5색**: 동일 L=0.62 C=0.16, hue 5등분 (258°/178°/138°/60°/348°)
- **Radius**: `--radius-card: 12px` (일반 카드) / `--radius-card-warm: 16px` (인사·회의실 도메인)
- **Shadow**: `--shadow-card` (subtle) / `--shadow-action` (primary 버튼 blue tint)
- **Font**: Pretendard Variable, body 15px LH 1.70, heading LH 1.35, letter-spacing 0
- **Button**: 좌우 padding 22px (`--btn-px`)
- **Korean**: `word-break: keep-all` + `overflow-wrap: break-word` body 기본

### 컴포넌트별 핵심 패턴 (프로토타입 → Tailwind 매핑)

```
Sidebar:
  - 컨테이너: w-[248px] bg-surface border-r border-border h-screen shrink-0
  - 로고 박스: w-[30px] h-[30px] bg-foreground rounded-lg (다이아몬드: bg-[var(--primary-foreground)] rotate-45)
  - 브랜드: text-base font-bold text-foreground + 11.5px muted-foreground 메타
  - "메뉴" 라벨: text-[11px] font-semibold uppercase tracking-[0.07em] pt-[22px] px-7 pb-2
  - nav-item: py-[9px] px-[14px] rounded-lg text-sm font-medium transition-colors
  - 활성: bg-surface-2 text-foreground font-semibold / 아이콘 text-primary
  - 호버: hover:bg-surface-2 hover:text-foreground

TopBar:
  - 컨테이너: h-16 flex items-center justify-between px-8 bg-surface border-b border-border
  - 검색창: flex items-center gap-[10px] py-2 px-[14px] bg-surface-2 rounded-lg w-[380px] border border-transparent
  - 포커스: focus-within:bg-surface focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--ring)]
  - kbd 배지: text-[11px] font-mono font-semibold bg-surface border border-border rounded px-[7px] py-0.5
  - 알림 버튼: w-[38px] h-[38px] rounded-lg text-muted-foreground hover:bg-surface-2
  - 구분선: w-px h-6 bg-border mx-[6px]

카드 기본:
  - bg-surface border border-border rounded-xl shadow-[var(--shadow-card)]  (radius-card = 12px → rounded-xl)
  - warm 카드: rounded-2xl  (radius-card-warm = 16px → rounded-2xl)
  - card-head: px-[22px] py-[18px] border-b border-border flex items-center justify-between gap-3
  - card-title: text-[15px] font-semibold text-foreground
  - card-sub: text-[13px] text-muted-foreground font-medium mt-0.5
  - card-body: px-[22px] pt-5 pb-[22px]

Stat 카드:
  - stat-icon: w-9 h-9 rounded-lg flex items-center justify-center
  - primary tone: bg-[oklch(0.555_0.180_258/0.10)] text-primary
  - success tone: bg-[var(--success-bg)] text-[var(--success-fg)]
  - warning tone: bg-[var(--warning-bg)] text-[var(--warning-fg)]
  - info tone: bg-[var(--info-bg)] text-[var(--info-fg)]
  - stat-label: text-[11.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]
  - stat-value: text-[28px] font-bold text-foreground tabular-nums

Badge:
  - inline-flex items-center gap-[5px] px-[9px] py-[3px] rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0
  - success: bg-[var(--success-bg)] text-[var(--success-fg)]
  - warning: bg-[var(--warning-bg)] text-[var(--warning-fg)]
  - info: bg-[var(--info-bg)] text-[var(--info-fg)]
  - error: bg-[var(--error-bg)] text-[var(--error-fg)]
  - muted: bg-surface-2 text-muted-foreground

Filter Pill (인사 관리):
  - inline-flex items-center gap-[7px] px-[14px] py-[7px] bg-surface border border-border rounded-full text-[13px] font-medium
  - 활성: bg-primary text-white border-primary shadow-[var(--shadow-action)]
  - count 뱃지: text-[11.5px] font-semibold px-[6px] py-px rounded-full bg-black/[0.07]
  - 활성 count: bg-white/[0.18]

Personnel 테이블 (warm card):
  - 래퍼: bg-surface border border-border rounded-2xl overflow-x-auto shadow-[var(--shadow-card)]
  - th: text-[11.5px] font-semibold text-muted-foreground uppercase tracking-[0.07em] px-[18px] py-[14px] bg-surface-2 border-b border-border whitespace-nowrap
  - td: text-[14px] text-foreground px-[18px] py-[14px] border-b border-surface-2 vertical-align-middle
  - 호버: hover:bg-surface-2

Pagination:
  - page-btn: w-8 h-8 rounded-lg border border-border bg-surface text-[13px] font-medium tabular-nums
  - 활성: bg-primary border-primary text-white
```

### 스타일 작업 원칙

1. **기능 로직(API 호출, 상태, 데이터 바인딩) 절대 수정 금지** — className/style/레이아웃만 교체
2. 프로토타입(`tokens-v2-preview.html`)에 있는 화면 → 해당 CSS를 Tailwind로 1:1 번역
3. 프로토타입에 없는 화면(meetingroom, parking 등) → 위 토큰 패턴을 일관성 있게 적용
4. 한국어 라벨/배지/테이블 헤더 → `whitespace-nowrap` + Badge는 `shrink-0` 추가
5. `bg-white` → `bg-surface`, `border-gray-100` → `border-border`, `text-gray-400/500/600` → `text-muted-foreground`, `text-gray-900` → `text-foreground`

### 20-1. 수정 필요 파일 목록 (Tokens v2 마이그레이션 대상)

**작업 브랜치**: `design/tokens-v2`  
**원칙**: 기능 로직 불변, className/style 색상값/recharts 색상 props 만 교체.

#### 기능 결합 파일 주의 (색상이 로직과 섞임)

수정 전 삼항 색상·status 맵·`fill=`/`stroke=` 위치를 먼저 grep으로 식별한다.
- **recharts 색상 props (SVG `fill`/`stroke` — `var(--chart-N)` 값 사용)**: `IntegratedDashboard.tsx`, `building/PowerHourlyChart.tsx`
- **status/조건부 색상 (삼항·맵)**: `AccessRecordTable`, `GuestTable`, `PersonnelTable`, `ZoneManagement`, `SalaryManagement`, `MeetingRoomManagement`, `InventoryManagement`, `Sidebar`(active 상태), `building/ControlPanel`, `personnel/PersonnelListTable·PersonnelDetailDrawer·AttendanceTab·DepartmentSidebar`, `zone/ZoneListView·ZoneDetailView·tabs/DeviceListTab`, `parking/ParkingSpotsTable·VehicleSection·ReservationSection·ParkingZoneMap`, `salary/SalaryRecordsTable·SalarySettingsTable`, `meetingroom/ReservationListTable·ReservationDetailDrawer`, `nfccard/NfcCardListTable·NfcCardDetailDrawer·NfcCardIssueModal`
- **인라인 `style={{}}`**: `parking/ParkingZoneMap.tsx` — style 객체 보존, 색상값만 교체

#### 전체 체크리스트 (실행 순서대로)

**C1 — 인프라**
- [ ] `src/index.css` — capstone 정본 기반 전면 교체 + `--foreground-soft`·`--border-strong` 추가
- [ ] `package.json` — `@fontsource-variable/geist` 제거 + npm install

**C2 — auth/ (C1 직후 토큰 스모크 테스트)**
- [ ] `src/components/auth/LoginPage.tsx`

**C3 — components/ui/**
- [ ] `components/ui/DatePicker.tsx`
- [ ] `components/ui/slider.tsx`

**C4 — common/**
- [ ] `src/components/common/ErrorBoundary.tsx`
- [ ] `src/components/common/ZoneSelect.tsx`

**C5 — App + dashboard/** (셸 Sidebar→TopBar→App.tsx 먼저, 셸 완료 후 dev 서버 전체 점검)
- [ ] `src/components/dashboard/Sidebar.tsx` ← 중 (active 상태 조건부 색상)
- [ ] `src/components/dashboard/TopBar.tsx` ← 중
- [ ] `src/App.tsx` ← 중 (NavGuard 모달 semantic 색상)
- [ ] `src/components/dashboard/widgets/PowerBillingWidget.tsx`
- [ ] `src/components/dashboard/widgets/PowerCurrentWidget.tsx`
- [ ] `src/components/dashboard/IntegratedDashboard.tsx` ← 상 (recharts + 48 하드코딩)
- [ ] `src/components/dashboard/AccessRecordTable.tsx` ← 중 (status 맵 + 40)
- [ ] `src/components/dashboard/GuestTable.tsx` ← 중 (status 맵 + 54)
- [ ] `src/components/dashboard/InventoryManagement.tsx` ← 중 (94 하드코딩 최다)
- [ ] `src/components/dashboard/PersonnelTable.tsx`
- [ ] `src/components/dashboard/BuildingManagement.tsx`
- [ ] `src/components/dashboard/MeetingRoomManagement.tsx`
- [ ] `src/components/dashboard/NfcCardManagement.tsx`
- [ ] `src/components/dashboard/ParkingManagement.tsx`
- [ ] `src/components/dashboard/SalaryManagement.tsx`
- [ ] `src/components/dashboard/ZoneManagement.tsx`

**C6 — personnel/**
- [ ] `src/components/personnel/PersonnelListTable.tsx` ← 중 (44 하드코딩)
- [ ] `src/components/personnel/AttendanceTab.tsx` ← 중 (43 하드코딩)
- [ ] `src/components/personnel/PersonnelDetailDrawer.tsx` ← 중 (status 색상)
- [ ] `src/components/personnel/MyProfileSection.tsx`
- [ ] `src/components/personnel/PersonnelNfcCardTab.tsx`
- [ ] `src/components/personnel/DepartmentSidebar.tsx` ← 중 (조건부 색상)

**C7 — zone/**
- [ ] `src/components/zone/ZoneListView.tsx` ← 중 (status 색상)
- [ ] `src/components/zone/ZoneDetailView.tsx` ← 중 (status 색상)
- [ ] `src/components/zone/tabs/DeviceListTab.tsx` ← 중 (30 하드코딩)
- [ ] `src/components/zone/tabs/ZoneInfoTab.tsx`
- [ ] `src/components/zone/tabs/ZonePowerTab.tsx`
- [ ] `src/components/zone/tabs/ZoneReservationTab.tsx`

**C8 — parking/**
- [ ] `src/components/parking/ParkingSpotsTable.tsx` ← 중 (64 하드코딩)
- [ ] `src/components/parking/VehicleSection.tsx` ← 중 (35 하드코딩)
- [ ] `src/components/parking/ReservationSection.tsx` ← 중 (31 하드코딩)
- [ ] `src/components/parking/ParkingZoneMap.tsx` ← 중 (인라인 style 주의)
- [ ] `src/components/parking/ParkingZoneSummary.tsx`

**C9 — salary/**
- [ ] `src/components/salary/SalaryRecordsTable.tsx` ← 중 (36 하드코딩)
- [ ] `src/components/salary/SalarySettingsTable.tsx` ← 중 (33 하드코딩)
- [ ] `src/components/salary/SalaryCalculateModal.tsx`

**C10 — building/**
- [ ] `src/components/building/PowerHourlyChart.tsx` ← 중 (recharts hex → var(--chart-N))
- [ ] `src/components/building/SensorChart.tsx` (차트 아님 — className만)
- [ ] `src/components/building/ControlPanel.tsx` ← 중 (조건부 색상)
- [ ] `src/components/building/PowerZoneBillingTable.tsx`
- [ ] `src/components/building/PowerBillingCalculateModal.tsx`

**C11 — meetingroom/**
- [ ] `src/components/meetingroom/ReservationListTable.tsx` ← 중 (status 색상)
- [ ] `src/components/meetingroom/ReservationDetailDrawer.tsx` ← 중 (status 색상)
- [ ] `src/components/meetingroom/ZoneReservationCalendar.tsx`

**C12 — nfccard/**
- [ ] `src/components/nfccard/NfcCardListTable.tsx` ← 중 (29 하드코딩)
- [ ] `src/components/nfccard/NfcCardIssueModal.tsx` ← 중 (status 색상)
- [ ] `src/components/nfccard/NfcCardDetailDrawer.tsx` ← 중 (status 색상)

**합계: 인프라 2 + 컴포넌트 52 = 54개 파일**
