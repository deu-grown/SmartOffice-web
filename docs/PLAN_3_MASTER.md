# 플랜 3 마스터플랜 (SmartOffice-web ↔ SmartOffice-server 도메인 통합)

> 작성일: 2026-05-14
> 상태: 사용자 확정 (결정 1~7 + 보강 A·B·C 반영)
> 다음 단계: 별도 plan mode 세션에서 플랜 3-1 진입
> 본 문서는 플랜 3 전체 작업의 단일 진실 공급원. 각 플랜(3-1~3-4·마지막) 진행 시 본 문서를 참조한다.

---

## 0. 입력 요약

### 0-1. 분류 최종 (1단계 확정)

| cat | 수 | 비고 |
|-----|----|----|
| 1 신규 페이지 | 6 | reservation 1 + nfccard 5 → 신규 페이지 2 |
| 2 기존 흡수 | 53 | G2~G9에 분산 |
| 3 모바일 | 7 | 본 플랜 범위 외 (모바일 작업 영역) |
| 4 IoT permitAll | 3 | 본 플랜 범위 외 (IoT 작업 영역) |
| 5 공용 웹+앱 | 8 | web 호출 + 모바일 호환 (DTO 1:1) |
| **합** | **77** | |

### 0-2. 그룹 매핑 (cat 1 + cat 2 + cat 5 = 67)

| 그룹 | 페이지 | 흡수 엔드포인트 | 신규/수정 |
|------|--------|-----------------|-----------|
| **G2** 통합 관제 | IntegratedDashboard | dashboard 4 + power 2 (current, billing) | 수정 |
| **G3** 인사·부서 | PersonnelTable | user 6 + dept 4 + att 3 + cat5 user 2 | 수정 (대규모) |
| **G4** 출입 기록 | AccessRecordTable | accesslog 1 | 수정 (소) |
| **G5** 구역·장치 | ZoneManagement | zone 5 + device 5 | 수정 (대규모) |
| **G6** 급여 | SalaryManagement | salary 6 | 수정 |
| **G7** 건물·환경·제어 | BuildingManagement | sensor 2 + control 3 + power 3 (hourly, zone-billing, calculate) | 수정 |
| **G8** 재고/자산 | InventoryManagement | asset 5 | 수정 |
| **G9** 주차 | ParkingManagement | parking 4 + cat 5 parking 2 | 수정 (대규모) |
| **G10** 회의실 신규 | MeetingRoomManagement (신규) | reservation 1 + cat 5 reservation 4 | **신규 페이지** |
| **G11** NFC 카드 신규 | NfcCardManagement (신규) | nfccard 5 | **신규 페이지** |

### 0-3. G1 인증 (Plan 2 완료) — 검증만

별도 작업 없음. 매 플랜 시작 시 axios 401 인터셉터 / TokenStorage / 가드 회귀 확인.

### 0-4. power 5개 분배 근거 (확정)

실시간·총괄(`current`, `billing`) → G2 대시보드 위젯 / 시간별·구역별·배치(`hourly`, `zone-billing`, `calculate`) → G7 운영 관리.

---

## 1. 거대 컴포넌트 식별 및 분할 (선행)

| 컴포넌트 | 현재 | 흡수 후 예상 | 분할 결정 |
|----------|------|-----------------|------------|
| PersonnelTable | 532줄 | +dept 4 + att 3 + cat5 user 2 → ~800줄 | **분할 필수** |
| ZoneManagement | 800줄 | +device 5 + 회의실 진입 연계 → ~1100줄 | **분할 필수** |
| ParkingManagement | 717줄 | +현황/지도 hook → ~850줄 | **분할 필수** |
| SalaryManagement | 미측정 | salary 6 흡수 | **3-2 진입 시 1회 측정 후 분할 여부 판단** |

**분할 가이드 (분할은 그룹 첫 커밋, 빈 분할 — 코드 이동만, 기능 추가 X)**:

- PersonnelTable → `PersonnelListTable.tsx` + `PersonnelDetailDrawer.tsx` + `DepartmentSidebar.tsx` + `AttendanceTab.tsx` + 컨테이너 ~150줄
- ZoneManagement → `ZoneListView.tsx` + `ZoneDetailView.tsx` + 탭 4종(`ZoneInfoTab`/`DeviceListTab`/`ZoneReservationTab`/`ZonePowerTab`) + 컨테이너 ~150줄
- ParkingManagement → `ParkingSpotsTable.tsx` + `ParkingZoneSummary.tsx` + `ParkingZoneMap.tsx` + 컨테이너 ~150줄

**페이지 컨테이너 라인 수 목표**: 분할 후 모두 ~150줄 이내 유지.

**분할/신규 컴포넌트 디렉터리 컨벤션**:

- 컨테이너(`PersonnelTable.tsx` · `ZoneManagement.tsx` 등 페이지 상위 컴포넌트)는 `src/components/dashboard/` 유지 (App.tsx import 경로 호환).
- 분할된 자식 컴포넌트는 페이지 도메인별 신규 폴더에 배치:
  - `src/components/personnel/` (G3) · `src/components/zone/` (G5) · `src/components/parking/` (G9) · `src/components/building/` (G7) · `src/components/meetingroom/` (G10) · `src/components/nfccard/` (G11)
- 위젯·공용 시각화는 `src/components/dashboard/widgets/` (G2 전력 위젯 등).

---

## 2. cat 5 공용 컨벤션 (web 측)

- `features/{domain}/types.ts`는 백엔드 DTO와 **1:1 영문 필드 정확 매핑**.
- `features/{domain}/api.ts`는 thin wrapper. 한 함수 = 한 엔드포인트.
- 추상 hook 인프라 X. 일반 `useQuery`/`useMutation` 직접 호출.
- hook 본인 분기 표현은 별도 강제 X (자연스럽게 작성).
- 모바일(Flutter)과 코드 공유 X. **계약(요청/응답 타입) 호환만 보장** (OpenAPI 스키마 단일 진실 공급원).
- **마지막 플랜에서 web md 3종에 본 컨벤션 한 줄 추가**.

---

## 3. MSW 핸들러 정책

- **각 `feat({domain})` 커밋에 해당 도메인 MSW 핸들러 동시 포함**.
- 사유: 매 커밋 직전 빌드/lint/test 통과가 게이트. 핸들러 없으면 test 미실행.
- `test({domain})` 커밋은 통합 테스트 보강 용도로 별도 유지 가능 (선택적).
- 핸들러는 test 환경에서만 활성화 (운영 빌드 침투 X).

---

## 4. 그룹별 상세 (G2~G11)

### G2 — 통합 관제 (IntegratedDashboard, cat 2: dashboard 4 + power 2)

**엔드포인트** (정확 경로는 플랜 3-1 진입 시 DashboardController 또는 server CLAUDE.md 재확인 후 정정):

- GET /api/v1/dashboard/summary — 통합 요약 카드
- GET /api/v1/dashboard/sensors/current — 실시간 센서 현황
- GET /api/v1/dashboard/attendance/today — 오늘 근태 현황
- GET /api/v1/dashboard/access/recent — 최근 출입 이벤트
- GET /api/v1/power/zones/{zoneId}/current — 실시간 전력 위젯
- GET /api/v1/power/billing?year&month — 월 요금 총괄 위젯

**영향 파일**:

- 신규:
  - `src/features/dashboard/{types.ts, api.ts, queryKeys.ts, hooks.ts}`
  - `src/features/power/{types.ts, api.ts, queryKeys.ts, hooks.ts}` (G7과 확장 공유)
  - `src/components/dashboard/widgets/PowerCurrentWidget.tsx`
  - `src/components/dashboard/widgets/PowerBillingWidget.tsx`
- 수정:
  - `src/components/dashboard/IntegratedDashboard.tsx` — mock 제거, 위젯 단위 조립
  - 기존 dashboard 하위 컴포넌트들 — 분류표 기준 4 엔드포인트 응답 매핑

**작업 순서**:

1. **DashboardController 또는 server CLAUDE.md 재확인 → 정확 경로 확정** (선행)
2. features/dashboard 골격 (types → api → queryKeys → hooks) + MSW 핸들러
3. features/power 골격 (G2 hook 2개: `usePowerCurrent`, `usePowerBilling`) + MSW 핸들러
4. 위젯 컴포넌트 신규 (Skeleton + ErrorBoundary 포함)
5. IntegratedDashboard.tsx 위젯 조립 + mock 제거

**커밋 단위**:

- `feat(dashboard): dashboard features 골격 + types/api/hooks + MSW 핸들러`
- `feat(power): G2 위젯용 power features 골격 (current/billing) + MSW 핸들러`
- `feat(dashboard): power 위젯 2종 신규 (current/billing)`
- `refactor(dashboard): IntegratedDashboard mock 제거 후 위젯 조립`

**사이드 이펙트/리스크**:

- features/power는 G7에서 hook 3개 추가됨 → G2 단계에서 hooks.ts를 확장 가능한 구조로 시작.
- dashboard 응답에 zone status 포함 시 G5와 queryKey 충돌 → 네임스페이스 분리 (`['dashboard', ...]` vs `['zone', ...]`).
- **dashboard 경로 추정 사용 금지** — 정정 후 진입.

**1순위 항목 적용**:

- ErrorBoundary: 위젯 단위 (전력 위젯 실패해도 KPI 표시)
- Skeleton: 위젯별 별도
- 분리: 페이지 컨테이너 신규 조립에 가까움 — 별도 분할 불필요

---

### G3 — 인사·부서 (PersonnelTable, cat 2: user 6 + dept 4 + att 3, cat 5: user 2)

**엔드포인트**:

- user 6 (ADMIN): GET/POST/GET-id/PUT/DELETE /api/v1/users, GET /api/v1/users/{id}/access-logs
- dept 4 (ADMIN): /api/v1/departments CRUD (GET 목록 / POST 등록 / PUT 수정 / DELETE 삭제)
- att 3 (ADMIN): `GET /api/v1/attendance/daily`(임의 날짜 일별 목록) + `PUT /api/v1/attendance/{id}`(수동 보정) + `POST /api/v1/attendance/batch`(월간 일괄 산출 수동 트리거, **위험 액션** — 멱등 X, 기존 결과 덮어쓰기)
- cat 5 user 2: **GET 은 `/api/v1/auth/me` 사용 (features/auth.useMe 재사용, web CLAUDE.md 13절 정합) / POST 만 `/api/v1/users/me` 사용 (features/user 신규 `useUpdateMyInfo`)**

**영향 파일**:

- 신규:
  - `src/features/user/{...}`
  - `src/features/department/{...}`
  - `src/features/attendance/{...}` (cat 3 모바일 2개 제외, ADMIN 3개만)
  - `src/components/personnel/PersonnelListTable.tsx`
  - `src/components/personnel/PersonnelDetailDrawer.tsx`
  - `src/components/personnel/DepartmentSidebar.tsx`
  - `src/components/personnel/AttendanceTab.tsx`
  - `src/components/personnel/MyProfileSection.tsx`
- 수정:
  - `src/components/dashboard/PersonnelTable.tsx` — 컨테이너 ~150줄

**작업 순서**:

1. **PersonnelTable 컴포넌트 분할** (빈 분할, 코드 이동만) — 1 커밋
2. features/department 골격 + MSW 핸들러 + DepartmentSidebar 연결
3. features/user 골격 + MSW 핸들러 + 목록/상세/생성/수정/퇴사
4. features/attendance 골격 + MSW 핸들러 + AttendanceTab
5. cat 5 user/me hook (user features 내부) + MyProfileSection

**커밋 단위**:

- `refactor(personnel): PersonnelTable 컴포넌트 분할` (이동만)
- `feat(department): department features 골격 + 사이드바 연결 + MSW 핸들러`
- `feat(user): user CRUD + 출입 이력 탭 + MSW 핸들러`
- `feat(attendance): ADMIN 근태 3종 흡수 + MSW 핸들러`
- `feat(user): cat 5 본인 정보 조회/수정 (me 2종) + MSW 핸들러`

**사이드 이펙트/리스크**:

- 분할 커밋은 단독 (회귀 검출 용이).
- user/me 응답 DTO 변경은 모바일 영향 → DTO 변경 X, 백엔드 따라가기만.
- access-logs 탭은 features/accesslog와 hook 공유 → G4 후 진입 또는 user features 내부에서 wrap.

**1순위 항목 적용**:

- ErrorBoundary: 탭 단위 (목록/상세/근태/본인정보 각각)
- Skeleton: 표 / 드로어 / 탭 콘텐츠 각각
- 분리: 1절 가이드 적용

---

### G4 — 출입 기록 (AccessRecordTable, cat 2: accesslog 1)

**엔드포인트**: GET /api/v1/access-logs (전체 ADMIN 조회, 필터: zoneId/userId/authResult/direction/startDate/endDate/page/size)

**영향 파일**:

- 신규: `src/features/accesslog/{types.ts, api.ts, queryKeys.ts, hooks.ts}`
- 수정: `src/components/dashboard/AccessRecordTable.tsx`

**작업 순서**:

1. features/accesslog 골격 + MSW 핸들러
2. AccessRecordTable mock 제거 + 필터/페이지네이션 연결
3. G3 user/{id}/access-logs hook 공유 (`useUserAccessLogs`)

**커밋 단위**:

- `feat(accesslog): accesslog features 골격 + 전체 출입 로그 조회 + MSW 핸들러`
- `refactor(accesslog): AccessRecordTable mock 제거`

**사이드 이펙트/리스크**:

- G3와 hook 공유 → G4 작업 시 features/accesslog에 user 단위 hook 추가 가능하게 설계.

**1순위 항목 적용**:

- ErrorBoundary: 페이지 1개
- Skeleton: 표
- 분리: 페이지 규모 작음 → 불필요

---

### G5 — 구역·장치 (ZoneManagement, cat 2: zone 5 + device 5)

**엔드포인트**:

- zone 5: `GET 목록 / GET /tree / POST / PUT / DELETE` /api/v1/zones (**GET /{id} 없음** — `ZoneListItemResponse` 의 `find(id)` 클라이언트 우회. 9절 결함 #4 참조)
- device 5: GET/POST/GET-id/PUT/DELETE /api/v1/devices

**zone 도메인 모델 (백엔드 실제 — 마스터플랜 정정 1.1b)**:

- `ZoneType` enum = `FLOOR | AREA | ROOM` (3종, 계층 표시용). **권한 카테고리 모델("보안구역/사무공간/공용공간/일반구역")은 백엔드에 존재하지 않음** — 기존 mock UI 의 매핑은 제거 대상.
- **`floor` 컬럼·속성 부재** — `zoneType=FLOOR` 인 zone 자체가 "층", `parentId` 로 계층 표현. 평면도 UI 는 `zoneType=FLOOR` zone 선택 → 해당 zone 의 자식(`parentId === FLOOR.id`) 표시로 재구성.
- 기존 mock UI 의 `gateActive` · `permissions` · `groups` 모델 모두 백엔드 부재 — mock 제거 시 함께 제거.
- ZoneInfoTab 표시 필드 (`ZoneListItemResponse` 6 필드): `id` · `name` · `zoneType` (한국어 라벨: FLOOR=층, AREA=구역, ROOM=방) · `parentId` (부모 zone 이름 lookup 표시) · `description` · `createdAt`.

**영향 파일**:

- 신규:
  - `src/features/zone/{...}`
  - `src/features/device/{...}`
  - `src/components/zone/ZoneListView.tsx`
  - `src/components/zone/ZoneDetailView.tsx`
  - `src/components/zone/tabs/ZoneInfoTab.tsx`
  - `src/components/zone/tabs/DeviceListTab.tsx`
  - `src/components/zone/tabs/ZoneReservationTab.tsx` (G10 진입 전까지 placeholder)
  - `src/components/zone/tabs/ZonePowerTab.tsx` (G7 진입 전까지 placeholder)
- 수정:
  - `src/components/dashboard/ZoneManagement.tsx` — 컨테이너 ~150줄

**작업 순서**:

1. **ZoneManagement 컴포넌트 분할** (빈 분할) — 1 커밋
2. features/zone 골격 + MSW 핸들러 + 목록/CRUD (5 함수, GET /{id} 미포함). hook 설계: `useZones()` / `useZoneTree()` / `useZoneDetail(id)` [`useZones()` 응답 `find(z => z.id === id)` 클라이언트 우회, `// TODO[BACKEND_SUGGESTIONS #10]: GET /{id} 도입 시 useQuery swap + queryKey(zoneKeys.detail(id)) 유지` 마커] / `useCreateZone` / `useUpdateZone` / `useDeleteZone`
3. features/device 골격 + MSW 핸들러 + DeviceListTab 흡수
4. ZoneReservationTab placeholder (G10에서 활성화)
5. ZonePowerTab placeholder (G7에서 활성화)

**커밋 단위**:

- `refactor(zone): ZoneManagement 컴포넌트 분할`
- `feat(zone): zone features 골격 + CRUD + MSW 핸들러`
- `feat(device): device features 골격 + 설치 장치 탭 흡수 + MSW 핸들러`

**사이드 이펙트/리스크**:

- 탭 구조가 G10/G7과 연결 → 탭 ID/라우팅 컨벤션을 G5 단계에 굳히기. 후속 변경 비용 큼.
- device 삭제 cascade 동작은 백엔드 확인 (read-only). 발견 시 BACKEND_SUGGESTIONS.md.

**1순위 항목 적용**:

- ErrorBoundary: 탭 단위
- Skeleton: 목록/상세/탭별
- 분리: 1절 가이드 적용

---

### G6 — 급여 (SalaryManagement, cat 2: salary 6)

**엔드포인트**: salary record 4 + salary setting 3 − cat 3 모바일 1 = 6개

- record: `POST /salary/records/calculate` (위험 액션 — DRAFT 산출, CONFIRMED 는 스킵) · `PUT /salary/records/{id}/confirm` · `GET /salary/records` (목록, ADMIN) · `GET /salary/records/me` (모바일, 본 플랜 범위 외)
- setting: `POST /salary/settings` · `GET /salary/settings` · `PUT /salary/settings/{id}` — **`DELETE` 미지원, UI 미노출. 직급별 기준 데이터의 급여 산출 이력 invariant 보호 의도로 추정. `BACKEND_SUGGESTIONS` 등록 X**

**분할 결정 (3-2 진입 시 확정)**: 실측 232줄 (분할 임계 미만). 그러나 흡수 항목 (record list / 산출 모달(위험 액션) / 확정 액션 / setting list / 등록 / 수정 + mock 제거) 후 ~550~700줄 예상 (임계 초과 거의 확정). **β 옵션 (처음부터 분리) 확정** — `SalaryRecordsTable.tsx` + `SalarySettingsTable.tsx` + `SalaryCalculateModal.tsx` + 컨테이너 ~150줄. record 산출 모달 위험 액션 격리는 G7 `PowerBillingCalculateModal.tsx` 와도 패턴 통일 (`AttendanceBatchTriggerButton` 재사용, `personnel/AttendanceTab.tsx:254`).

**영향 파일**:

- 신규: `src/features/salary/{...}` (record + setting 통합 또는 분리는 백엔드 도메인 따라감)
- 수정: `src/components/dashboard/SalaryManagement.tsx` (분할 결정 시 컨테이너 ~150줄)

**작업 순서**:

1. **SalaryManagement β 분할** (빈 분할, 코드 이동 + record/setting 2-탭 도입, mock 유지) — 1 커밋
2. features/salary 골격 + MSW 핸들러 + record/setting hook + `SalaryCalculateModal.tsx` 위험 액션 4단계 패턴 + mock 제거 + 빈 상태 UI — 1 커밋

**커밋 단위**:

- `refactor(salary): SalaryManagement 컴포넌트 분할 (β)`
- `feat(salary): salary features 골격 + record/setting + calculate 위험 액션 + MSW 핸들러`

**사이드 이펙트/리스크**:

- AttendanceScheduler(매월 1일 00:10) 산출 결과 → 첫 진입 시 데이터 비어 있을 수 있음. 빈 상태 UI 명시.

**1순위 항목 적용**:

- ErrorBoundary: 페이지 + 산출 모달 별도
- Skeleton: 표
- 분리: 라인 수 측정 결과에 따름

---

### G7 — 건물·환경·제어 (BuildingManagement, cat 2: sensor 2 + control 3 + power 3)

**엔드포인트**:

- sensor 2 (ADMIN, 정확 경로 진입 시 재확인): 센서 목록 + 통계 2종
- control 3: 출입문/조명/장치 제어 ADMIN 3종
- power 3: GET /power/zones/{zoneId}/hourly, GET /power/zones/{zoneId}/billing, POST /power/billing/calculate

**영향 파일**:

- 신규:
  - `src/features/sensor/{...}`
  - `src/features/control/{...}`
  - `src/features/power/hooks.ts` 확장 (G2 기반에 hourly/zone-billing/calculate 추가)
  - `src/components/building/PowerHourlyChart.tsx`
  - `src/components/building/PowerZoneBillingTable.tsx`
  - `src/components/building/PowerBillingCalculateModal.tsx`
  - `src/components/building/ControlPanel.tsx`
  - `src/components/building/SensorChart.tsx`
- 수정:
  - `src/components/dashboard/BuildingManagement.tsx`
  - `src/components/zone/tabs/ZonePowerTab.tsx` — G5 placeholder 활성화 (차트 wrap)

**작업 순서**:

1. features/sensor 골격 + MSW 핸들러
2. features/control 골격 + MSW 핸들러
3. features/power 확장 (hourly/zone-billing/calculate) + MSW 핸들러
4. 차트/테이블/모달 컴포넌트 신규
5. BuildingManagement mock 제거
6. ZonePowerTab 활성화 (G5 placeholder → 실제 차트)

**커밋 단위**:

- `feat(sensor): sensor features 골격 + MSW 핸들러`
- `feat(control): control features 골격 + MSW 핸들러`
- `feat(power): hourly/zone-billing/calculate 흡수 + MSW 핸들러`
- `refactor(building): BuildingManagement mock 제거`
- `feat(zone): ZonePowerTab 활성화 (G5 placeholder 연결)`

**사이드 이펙트/리스크**:

- POST /power/billing/calculate는 운영 액션 + 멱등 X ("기존 내역 덮어쓰기") → 확인 모달 필수, 결과 표시 모달.
- ZonePowerTab은 G5 placeholder 존재 가정 → G5 분할 결정 변경 시 G7 영향.

**1순위 항목 적용**:

- ErrorBoundary: 차트/패널/탭 단위
- Skeleton: 차트 별도
- 분리: BuildingManagement 라인 수 측정 후 결정 (control 패널·전력 차트는 위젯화 권장)

---

### G8 — 재고/자산 (InventoryManagement, cat 2: asset 5)

**엔드포인트**: POST/GET/GET-id/PUT/DELETE /api/v1/assets

**영향 파일**:

- 신규: `src/features/asset/{...}`
- 수정: `src/components/dashboard/InventoryManagement.tsx`

**작업 순서**:

1. features/asset 골격 + MSW 핸들러
2. InventoryManagement mock 제거

**커밋 단위**:

- `feat(asset): asset features 골격 + CRUD + MSW 핸들러`
- `refactor(inventory): InventoryManagement mock 제거`

**사이드 이펙트/리스크**:

- 자산(asset) ↔ 장치(device, G5) 도메인 혼동 가능 → 페이지 헤더에 구분 명시 ("자산=재고 품목, 장치=구역 설치 IoT").

**1순위 항목 적용**:

- ErrorBoundary / Skeleton 표준
- 분리: 페이지 규모 작아 불필요 (예상)

---

### G9 — 주차 (ParkingManagement, cat 2: parking 4, cat 5: parking 2)

**엔드포인트**:

- cat 2 (ADMIN): POST/PUT/DELETE /parking/spots, GET /parking/spots
- cat 5 (공용, 권한 없음): GET /parking/zones/{zoneId}/spots, GET /parking/zones/{zoneId}/map
- (cat 4 IoT: POST /parking/spots/{id}/status — 범위 외)

**영향 파일**:

- 신규:
  - `src/features/parking/{...}`
  - `src/components/parking/ParkingSpotsTable.tsx`
  - `src/components/parking/ParkingZoneSummary.tsx`
  - `src/components/parking/ParkingZoneMap.tsx`
- 수정: `src/components/dashboard/ParkingManagement.tsx` — 컨테이너 ~150줄

**작업 순서**:

1. **ParkingManagement 컴포넌트 분할** (빈 분할) — 1 커밋
2. features/parking 골격 (cat 2 + cat 5 통합) + MSW 핸들러
3. 분할된 컴포넌트 각각 hook 연결

**커밋 단위**:

- `refactor(parking): ParkingManagement 컴포넌트 분할`
- `feat(parking): parking features 골격 + spots CRUD + zone summary/map + MSW 핸들러`

**사이드 이펙트/리스크**:

- zone summary/map은 controller @PreAuthorize 없음 (SecurityConfig 확인 결과 인증만 요구) → 모바일도 동일 엔드포인트. 응답 DTO 안정성 유지.
- 지도(map) 렌더 방식 (SVG/캔버스) 결정은 컴포넌트 내부로 격리.

**1순위 항목 적용**:

- ErrorBoundary: 표/요약/지도 각각
- Skeleton: 지도 별도 (느린 렌더)
- 분리: 1절 가이드 적용

---

### G10 — 회의실 신규 (MeetingRoomManagement, cat 1: 1 + cat 5: 4)

**엔드포인트**:

- cat 1 (ADMIN): GET /api/v1/reservations (전체 목록)
- cat 5 (service-layer 권한 분기): GET /reservations/{id}, PUT /reservations/{id}, DELETE /reservations/{id}, GET /zones/{zoneId}/reservations
- (cat 3 모바일 3개: POST /reservations, GET /reservations/me, POST /reservations/{id}/check-in — 범위 외)

**영향 파일**:

- 신규:
  - `src/features/reservation/{...}`
  - `src/components/dashboard/MeetingRoomManagement.tsx`
  - `src/components/meetingroom/ReservationListTable.tsx`
  - `src/components/meetingroom/ZoneReservationCalendar.tsx`
  - `src/components/meetingroom/ReservationDetailDrawer.tsx`
- 수정:
  - `src/components/dashboard/Sidebar.tsx` — "회의실 관리" 메뉴 추가
  - `src/App.tsx` — /meeting-rooms 라우트 추가
  - `src/routes/paths.ts` — TabType / TAB_TO_PATH / PATH_TO_TAB에 "회의실 관리" 추가
  - `src/components/zone/tabs/ZoneReservationTab.tsx` — G5 placeholder 활성화

**작업 순서**:

1. routes/paths + Sidebar + App.tsx 라우트 추가 (1 커밋)
2. features/reservation 골격 + MSW 핸들러
3. MeetingRoomManagement 페이지 + 3 컴포넌트 신규
4. ZoneReservationTab 활성화 (G5 placeholder 연결)

**커밋 단위**:

- `feat(routes): 회의실 관리 메뉴/라우트/탭 신규`
- `feat(reservation): reservation features 골격 + MSW 핸들러`
- `feat(meetingroom): MeetingRoomManagement 페이지 신규`
- `feat(zone): ZoneReservationTab 활성화 (G5 placeholder 연결)`

**사이드 이펙트/리스크**:

- TabType enum 확장 → Sidebar/페이지 매칭 검증 필수.
- DELETE /reservations/{id}는 service-layer 본인/ADMIN 분기 → ADMIN UI에서 "타인 예약 강제 취소 가능" 명시 + 확인 모달.
- 모바일과 GET /zones/{zoneId}/reservations 공유 → 응답 DTO 안정성.

**1순위 항목 적용**:

- ErrorBoundary: 캘린더 / 목록 / 드로어 각각
- Skeleton: 캘린더 별도
- 분리: 신규 페이지 → 처음부터 컴포넌트 단위 설계

---

### G11 — NFC 카드 신규 (NfcCardManagement, cat 1: 5)

**엔드포인트**: POST/GET/GET-id/PUT/DELETE /api/v1/nfc-cards

**영향 파일**:

- 신규:
  - `src/features/nfccard/{...}`
  - `src/components/dashboard/NfcCardManagement.tsx`
  - `src/components/nfccard/NfcCardListTable.tsx`
  - `src/components/nfccard/NfcCardIssueModal.tsx`
  - `src/components/nfccard/NfcCardDetailDrawer.tsx`
- 수정:
  - `src/components/dashboard/Sidebar.tsx` — "NFC 카드 관리" 메뉴 추가
  - `src/App.tsx` — /nfc-cards 라우트 추가
  - `src/routes/paths.ts` — TabType 확장
  - `src/components/personnel/PersonnelDetailDrawer.tsx` (G3) — NFC 카드 발급/조회 링크 추가

**작업 순서**:

1. routes/paths + Sidebar + App.tsx 라우트 추가 (1 커밋)
2. features/nfccard 골격 + MSW 핸들러
3. NfcCardManagement 페이지 + 3 컴포넌트 신규
4. PersonnelDetailDrawer에 NFC 카드 링크 연결 (G3 의존)

**커밋 단위**:

- `feat(routes): NFC 카드 관리 메뉴/라우트/탭 신규`
- `feat(nfccard): nfccard features 골격 + MSW 핸들러`
- `feat(nfccard): NfcCardManagement 페이지 신규`
- `feat(personnel): PersonnelDetailDrawer에 NFC 카드 링크 연결`

**사이드 이펙트/리스크**:

- G3 선행 필수 (`G3 → G11`) — PersonnelDetailDrawer 존재 전제.
- NFC 카드 ↔ user 1:N → 발급 시 user 검색 hook 재사용.
- NFC UID 중복 검증은 백엔드 책임 → 프론트는 에러 메시지 표시만.

**1순위 항목 적용**:

- ErrorBoundary / Skeleton 표준
- 분리: 신규 페이지 → 처음부터 분리 설계

---

## 5. 플랜 분할 (확정: 권고 B, 4 플랜)

| 플랜 | 그룹 | 핵심 작업 | 예상 부하 |
|------|------|-----------|-----------|
| **3-1** | G2 + G3(+분할) + G4 | 대시보드 + 인사·부서·근태 + 출입 기록 | 중·대 (G3 분할 포함) |
| **3-2** | G5(+분할) + G6(라인 측정 후 분할 판단) + G7 | 구역·장치 + 급여 + 건물·환경·전력 | 대 (G5 분할 + G7 차트·운영) |
| **3-3** | G8 + G9(+분할) | 재고·자산 + 주차 | 중 |
| **3-4** | G10(신규) + G11(신규) | 회의실 + NFC 카드 (라우트·메뉴 변경 집중) | 중 |
| **마지막** | md 동기화 + push + PR | 문서 정리 + push 1회 + PR 2개 | 소 |

**의존 순서**: G3 → G11 (PersonnelDetailDrawer), G5 → G10 (zone 데이터), G5 → G7 (ZonePowerTab placeholder), G2 → G7 (features/power 확장).

---

## 6. 마지막 플랜 (md 동기화 + push + PR)

**작업**:

1. `SmartOffice-web/CLAUDE.md` · `AGENTS.md` · `GEMINI.md` 3종 동기화
   - cat 5 공용 컨벤션 한 줄 추가
   - features/{domain}/ 패턴에 G10/G11 신규 도메인 반영
   - Sidebar 메뉴 최종 목록 갱신
2. 10-Capstone 상위 `CLAUDE.md` · `AGENTS.md` · `GEMINI.md` 3종 — 현황 일자만 갱신
3. server·web 양쪽 `feature/web-integration` 브랜치 커밋 정리 확인
4. **동시 push 1회** (web + server 각각)
5. **분리 PR 2개 동시 생성**:
   - web PR: base `main`, head `feature/web-integration`
   - server PR: base `main`, head `feature/web-integration` (BACKEND_SUGGESTIONS.md 변경만 가능)
   - 본문 상호 링크 (web PR ↔ server PR)
6. PR 본문에 플랜 3-1~3-4 요약 + 분류표 + cat 5 컨벤션 명시

**검증 게이트** (각 커밋 직전 + push 전):

- web: `npm run lint && npm run build && npm test` 전부 통과
- server: `./gradlew build` 통과
- MSW 핸들러 환경 격리 확인 (운영 빌드 침투 X)

**9. 후속 작업 예고 — 백엔드 수정 플랜 (별도)**

- 본 플랜 종료 후 별도 plan mode 세션에서 진행.
- 대상: `SmartOffice-server/BACKEND_SUGGESTIONS.md` 누적 제안 (본 플랜 종료 시점의 모든 항목).
- 작업 순서: 본 플랜 web/server PR 머지 → 백엔드 수정 마스터플랜 수립 → 우선순위 상 항목부터 처리 (#7 dashboard summary 500 최우선).
- 본 플랜 잔존 게이트(예: dashboard summary 500 재검증)는 백엔드 수정 후 web 측에서 재호출 검증으로 마감.

---

## 7. 전체 리스크/사이드 이펙트 통합

| # | 리스크 | 영향 그룹 | 완화 |
|---|--------|-----------|------|
| 1 | DTO 변경 시 모바일 영향 (cat 5 8개) | G3·G9·G10 | OpenAPI 1차. 백엔드 DTO 따라가기. |
| 2 | 거대 컴포넌트 분할 회귀 | G3·G5·G9·(G6 조건부) | 분할 단독 커밋, 이동만 |
| 3 | TabType/라우트 확장 매칭 누락 | G10·G11 | 1 커밋 안에 paths + Sidebar + App.tsx 동시 변경 |
| 4 | power 도메인 G2·G7 동시 확장 충돌 | G2·G7 | hooks.ts를 G2에서 확장 가능한 구조로 시작 |
| 5 | service-layer 권한 분기 UI 미명시 | G10 | ADMIN 전용 액션에 확인 모달 |
| 6 | MSW 운영 빌드 침투 | 전체 | test 환경 격리 (Plan 2 셋업 확인) |
| 7 | 백엔드 개선 발견 시 수정 충동 | 전체 | BACKEND_SUGGESTIONS.md만 추가, 코드 수정 X |
| 8 | dashboard zones 응답과 zone features 캐시 충돌 | G2·G5 | queryKey 네임스페이스 분리 |
| 9 | AttendanceScheduler 미실행 시 G6 빈 응답 | G6 | 빈 상태 UI |
| 10 | push 정책 위반 | 전체 | 중간 push 0. 마지막 1회만. |
| 11 | **dashboard 4개 경로 추정 사용** | G2 | 플랜 3-1 진입 시 DashboardController/server CLAUDE.md 재확인 후 정정 |
| 12 | **G6 분할 판단 누락** | G6 | 3-2 진입 시 SalaryManagement.tsx 라인 수 1회 측정 |

---

## 8. 백엔드 (CLAUDE.md) 본 작업 적용 조항

- **수정 권한**: SmartOffice-web만. SmartOffice-server는 read-only 참고.
- **백엔드 개선 발견 시**: 즉시 `SmartOffice-server/BACKEND_SUGGESTIONS.md`에 추가 (기존 운영 파일). 항목 형식: 발생 맥락 / 제안 / 근거 / 우선순위 / 출처 세션.
- **커밋**: Conventional Commits. `Co-Authored-By: Claude ...` 금지. `🤖 Generated with` 금지. 한국어 본문 OK.
- **검증 게이트**: `npm run lint && npm run build && npm test` 전부 통과 후 커밋.
- **push**: 중간 push 0. 마지막 플랜에서 1회만 (web + server 동시).
- **PR**: web·server 분리 PR 2개, 상호 링크.
- **cat 3/4 (10개) 흡수는 모바일/IoT 작업 영역** — 본 플랜 범위 외.
- **백엔드 100% 활용 검증**: 본 플랜 + 모바일/IoT 작업 종료 후 unused 엔드포인트 0건 확인.
- **본 플랜은 `BACKEND_SUGGESTIONS.md` 누적까지. 실제 백엔드 코드 수정은 별도 플랜 (본 플랜 PR 머지 후).**

### 본 플랜 잔존 결함 추적 (마지막 플랜에서 PR 본문에 포함)

| # | 발견 시점 | 결함 | 처리 위치 |
|---|-----------|------|-----------|
| 1 | 묶음 2 검증 (2026-05-14) | `GET /api/v1/dashboard/summary` HTTP 500 (DashboardService 내부 예외 추정) | `SmartOffice-server/BACKEND_SUGGESTIONS.md` #7. 백엔드 수정 플랜에서 처리 |
| 2 | 묶음 3 검증 (2026-05-14) | `access_logs.authResult` 값 혼재 — V5 시드 잔존 `"ALLOW"` 8건 vs 코드 표준 `"APPROVED"` 53건 (`"DENIED"` / `"BLOCKED"` 도 함께 사용) | 묶음 4 검증에서 확인 완료. `SmartOffice-server/BACKEND_SUGGESTIONS.md` #8 등록. 백엔드 수정 플랜에서 V9 마이그레이션(`UPDATE access_logs SET auth_result='APPROVED' WHERE auth_result='ALLOW'`). 클라이언트는 `features/accesslog/types.ts` 의 literal union 에 `"ALLOW"` 호환 유지 |
| 3 | 플랜 3-1 시각 검증 (2026-05-14) | POWER 미터 보유 zone 목록 조회 엔드포인트 미존재. `GET /api/v1/dashboard/sensors/current` 는 환경 센서 보유 zone 만 반환하므로 web 의 G2 PowerCurrentWidget 이 회의실 A·B(POWER 만 보유) 를 표시할 수 없는 결함의 근본 원인이 됨 | 즉시 처리(web `fix(power): fc041b9`): `features/power/constants.ts` 의 `POWER_ZONES_TEMP` 임시 상수(V7 시드 기반 zone 2·4·5·7) + 자체 셀렉터로 우회. `SmartOffice-server/BACKEND_SUGGESTIONS.md` #9 등록. 채택 시 `usePowerZones()` 훅으로 전환하여 하드코딩 제거 |
| 4 | 플랜 3-2 0단계 (2026-05-14) | `GET /api/v1/zones/{id}` 부재 — `ZoneController` 에 `GET 목록 / GET /tree / POST / PUT / DELETE` 만 존재. `ZoneDetailResponse` DTO 자체 부재 | 즉시 우회: web `features/zone/hooks.ts:useZoneDetail(id)` 가 `useZones()` 응답을 `find(id)` 로 추출. `ZoneListItemResponse = { id, name, zoneType, parentId, description, createdAt }` 6 필드가 ZoneDetailView 표시 필드 100% 충족 검증 완료. `SmartOffice-server/BACKEND_SUGGESTIONS.md` #10 등록 (저~중). 채택 시 hook 내부 `useQuery` swap, queryKey(`zoneKeys.detail(id)`) 그대로 유지. **묶음 2 종료(2026-05-14) curl 검증으로 web 우회 동작 검증 완료**: `GET /api/v1/zones` (V8 시드 ~14건, 6 필드 1:1 정합) · `GET /api/v1/zones/tree` (재귀 children, parentId 누락 확인) · `GET /api/v1/devices` (9 필드 1:1 정합) · `GET /api/v1/devices/1` (+updatedAt). 백엔드 수정 플랜 이관 |

| 5 | 플랜 3-2 묶음 4 종료 (2026-05-14) | `GET /api/v1/power/zones/{zoneId}/hourly` HTTP 500 — POWER 미터 보유 zone (2/4/5/7) 모두 일관 실패. `startDate/endDate` 유무 무관. 동 컨트롤러의 `/billing` 은 정상 → `PowerService.getHourlyHistory` 만 결함 (HourlyPowerProjection mapping 또는 null 처리 추정) | `SmartOffice-server/BACKEND_SUGGESTIONS.md` #11 등록 (우선순위 **상**). web 측은 `usePowerHourly` isError + ErrorBoundary graceful handling 으로 동작 가능 (시각화만 비활성). 백엔드 수정 플랜에서 우선 처리 |
| 6 | 플랜 3-2 시각 검증 (2026-05-14) | (가) shadcn Select(`@base-ui/react/select` 기반) 의 `SelectValue` 가 선택된 SelectItem children 자동 매핑 X — raw value(zoneId 문자열·enum value) 노출. /dashboard 환경·전력 셀렉터 + /zones FLOOR 셀렉터 + /building zone 셀렉터 모두 영향. (나) `components/ui/select.tsx` SelectContent z-50 ↔ modal z-[100] 충돌로 modal 내부 드롭다운 가시·클릭 불가 (ZoneInfoTab 구역 유형 + DeviceListTab status). (다) `ControlPanel.QUICK_COMMANDS` 가 V8 시드 history(`AC/LIGHT/FAN`) 와 어긋남. (라) `ControlCommand.command_type` 정의 부재 (varchar(15) 자유 string). (마) LoginPage admin 계정 prefill 운영 빌드 노출 위험 | (가) `src/components/common/ZoneSelect.tsx` 신설 + 4 사용처 일괄 교체 (`fix(ui): ZoneSelect ...`). ZoneType/DeviceStatus Select 는 명시 children 1회 fix. (나) `fix(ui): Select z-index z-50 → z-[200]`. (다) `fix(control): QUICK_COMMANDS V8 정합` (AC/LIGHT/FAN/DOOR_LOCK). (라) `SmartOffice-server/BACKEND_SUGGESTIONS.md` #12 등록 (우선순위 **중**, ControlCommandType enum 또는 `/controls/commands` 메타). (마) `chore(auth): LoginPage prefill 환경 변수화` (`import.meta.env.DEV`). 모두 즉시 처리 완료 |
| 7 | 플랜 3-2 시각 재검증 (2026-05-14) | (Fix 4) `npm run start` 시연 환경 API 호출 실패 — `src/lib/api/client.ts` 의 `BASE_URL` 하드코딩(`"/api/v1"`) + `import.meta.env.VITE_API_URL` 사용 X + `.env.development`·`.env.production` 부재 + `server.ts` 가 정적 SPA 만 서빙(/api proxy 없음). (Fix 7) `PUT /api/v1/zones/{id}` body deserialize 결함 — 모든 body 변형이 "요청 본문을 읽을 수 없습니다" 응답. ZoneInfoTab 수정 모달이 모달은 정상이나 실제 저장 미반영 → 사용자 보고 "zone 이름 수정 후 사라짐". `ZoneUpdateRequest.clearParent` primitive boolean + setter 부재 추정. (Fix 8) Floor 전용 메타 필드 부재 (예: `floorNumber`, `totalArea`) — `Zone` entity 는 `zoneType=FLOOR` 라도 일반 zone 메타만 보유. (Fix 9) ControlPanel device Select trigger 가 SelectValue children 자동 매핑 결함으로 raw value(deviceId 문자열) 노출 (ZoneSelect 패턴 미적용 1곳 잔존) | (Fix 4) `fix(api): VITE_API_URL 환경변수 + server.ts http-proxy-middleware + ControlPanel device Select inline` (web `e759d56`) — (a)+(b) 동시 채택: `client.ts` `import.meta.env.VITE_API_URL` 분기, `.env.development`·`.env.production` 신설(`.gitignore` 예외 추가), `server.ts` 에 `http-proxy-middleware` 도입(`/api/v1 → API_TARGET`). (Fix 7) `SmartOffice-server/BACKEND_SUGGESTIONS.md` #13 등록 (우선순위 **상**, server `a12f497`). web 우회 불가, 백엔드 수정 플랜에서 처리. (Fix 8) 조치 X — 현재 모델(`zoneType=FLOOR` 자체가 층 표현)로 충분. UI 표시 필드 누락 없음. (Fix 9) ControlPanel device Select trigger inline 명시 (`e759d56` 동봉) — 사용처 1곳만이라 ZoneSelect 신설 X, inline 명시(옵션 b) 채택 |

(묶음 진행 중 추가 발견 시 본 표에 append.)

---

## 9. 진행 상태 트래커

각 플랜 진입/완료 시 본 절에 추가 기록한다.

| 플랜 | 상태 | 시작일 | 완료일 | 비고 |
|------|------|--------|--------|------|
| 마스터플랜 작성 | 완료 | 2026-05-14 | 2026-05-14 | 본 문서 |
| 플랜 3-1 (G2/G3/G4) | 완료 | 2026-05-14 | 2026-05-14 | web 19 커밋(`bc9a718`~`4a02d68`) + server 3 커밋(`f6327a7`/`41c7797`/`4be13f0`). 자동 검증 5단계 ✅ + 시각 검증(A USER 차단 / B 전력 위젯 자체 셀렉터) ✅. push 0회. 잔존 결함 #1·#2 백엔드 수정 플랜 이관, #3 즉시 우회 처리 |
| 플랜 3-2 (G5/G6/G7) | 대기 | — | — | G6 라인 측정 선행. 새 plan mode 세션 진입 |
| 플랜 3-3 (G8/G9) | 대기 | — | — | — |
| 플랜 3-4 (G10/G11) | 대기 | — | — | G3·G5 의존 |
| 마지막 (md+push+PR) | 대기 | — | — | web/server 분리 PR |
