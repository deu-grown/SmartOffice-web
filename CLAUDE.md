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

  features/                       # 도메인 19종: auth · user · department · attendance · accesslog · zone · device · dashboard · power · sensor · control · salary · asset · parking · reservation · nfccard · guest · vehicle · userPreferences
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
