# SmartOffice-web SUGGESTIONS

> 누적 제안 — 백엔드/외부 sprint에서 발견된 web 측 개선 사항. 본 통합 작업(2026-05)의 `SmartOffice-server/BACKEND_SUGGESTIONS.md` 와 대칭 패턴.

---

## [2026-05-15] 1. (중) ZoneInfoTab 수정 모달 parent Select + clearParent 토글 추가

- 발생 맥락: SmartOffice-server 백엔드 수정 sprint 플랜 1 #13 (PUT /zones/{id} deserialize fix, PR #27) 머지 직전 검증 단계에서 발견 (2026-05-15)
- 현재 결함: ZoneInfoTab 수정 모달에 상위 구역(parent) Select + clearParent 토글 UI 부재. 백엔드 `PUT /api/v1/zones/{id}` 는 parentId / clearParent 받지만 web 측 UI 미노출.
- 영향:
  - 본 server sprint #13 fix 머지 후 web 시연 시 name / description 데이터 손실 방지 가치는 확보
  - 그러나 상위 구역 변경 시나리오는 시연 불가 — curl 직접 호출로만 검증 가능
  - 사용자 권한 ADMIN 이라 백엔드 PUT 호출 권한 있으나 UI 부재로 접근 불가
- 제안: ZoneInfoTab 수정 모달에 다음 추가
  - 상위 구역 Select (ZoneSelect 공용 컴포넌트 재사용, `ZoneType=FLOOR/AREA` 한정 — 본인 자신 제외)
  - clearParent 토글 (체크박스 또는 Switch) — "상위 구역 명시적 제거" 의미
  - clearParent=true 시 parent Select 비활성화
- 우선순위: 중 (백엔드 PUT 기능 영구 차단은 아님, UI 보강 사안)
- 출처 세션: SmartOffice-server 백엔드 수정 sprint 플랜 1 #13 (PR #27, 2026-05-15)

---

## [2026-05-15] 2. (중) Select 컴포넌트 정합 결함 2건 — 표시값 영어 + 백엔드 부재 옵션 잔존

- 발생 맥락: SmartOffice-server 백엔드 수정 sprint 묶음 2 (#8 V9 마이그레이션) 시각 검증 중 발견 (2026-05-15)

- **결함 (a) 표시값 영어 잔존**:
  · /access-logs 의 authResult / direction Select 드롭다운 펼침 시 label(한글) 정상 표기, 선택 후 닫힘 상태에서 value(영어 enum) 노출
    - authResult: 선택 시 "APPROVED" 영어 표시 (기대: "승인")
    - direction: 선택 시 "ALL" / "IN" / "OUT" 영어 표시 (기대: "전체" / "입실" / "퇴실")
  · 추정 원인: Select 컴포넌트 controlled value 렌더링이 raw value 출력, label 매핑 함수 누락 (또는 displayValue prop 미사용)

- **결함 (b) 백엔드 부재 옵션 잔존**:
  · /access-logs 의 authResult Select 옵션 목록에 ALLOW 잔존 — 본 server sprint #8 fix(V9 마이그레이션 2026-05-15)로 백엔드 데이터가 APPROVED / DENIED / BLOCKED 로 정리되었으나 web 측 옵션 목록 미정정
  · 영향: 사용자가 ALLOW 선택 시 백엔드 응답 0건 (V9 후 ALLOW 데이터 부재) — 사용자 혼란
  · 추정 원인: features/accesslog/types.ts (또는 동등 위치) 의 enum 옵션 정의가 V9 마이그레이션 이전 값 보존

- 권장 (두 결함 일괄 처리):
  · features/accesslog/types.ts 또는 동등 위치의 enum 옵션 목록 정정 — ALLOW 제거 (literal union + Select 옵션 양쪽)
  · 공용 Select 컴포넌트의 label 매핑 정책 일괄 정정 (드롭다운 펼침/닫힘 일관)
  · 전역 Select 사용처 일괄 점검 — 본 통합 작업 PRE 1.1b/1.1c + 본 sprint 묶음 2까지 동일 패턴 반복 발견. 단건 패치보다 공용 정책 정정 권장

- 영향 페이지 (확정 + 추정):
  · /access-logs (확정 — authResult / direction Select)
  · 기타 enum Select 사용 페이지 전반 점검 필요

- 우선순위: 중 (시연 가능 + 데이터 정확성 보존, UX 품질 결함 + 사용자 혼란 위험)
- 출처 세션: SmartOffice-server 백엔드 수정 sprint 묶음 2 (2026-05-15)

---

## [2026-05-15] 3. (중) 백엔드 신설 엔드포인트 채택 시 web 측 우회 코드 제거

- 발생 맥락: SmartOffice-server 백엔드 수정 sprint 묶음 3 (#9·#10·#15 신설 엔드포인트) 완료 (2026-05-15)
- 배경: 본 통합 작업(플랜 3) 당시 백엔드 엔드포인트 부재로 web 측에 임시 우회 코드를 두었음. 백엔드 sprint 묶음 3 에서 해당 엔드포인트가 신설되어, web 측 우회 코드를 정식 hook 으로 전환 가능.

- 권장 전환 (3건):
  · **#9 채택** (`GET /api/v1/power/zones`): `features/power/constants.ts` 의 `POWER_ZONES_TEMP` 임시 상수 (V7 시드 기반 zone 2·4·5·7 하드코딩) 제거 → `usePowerZones()` 훅 신설. `PowerCurrentWidget` 의 Select 옵션 소스를 hook 응답으로 전환. 응답 필드: `{ zoneId, zoneName, meterCount }`
  · **#10 채택** (`GET /api/v1/zones/{id}`): `features/zone/hooks.ts:useZoneDetail(id)` 의 `useZones()` + `find(id)` 우회 제거 → `useQuery({ queryKey: zoneKeys.detail(id), queryFn: () => zoneApi.getZoneDetail(id) })` 전환. queryKey 그대로 유지하므로 컴포넌트 변경 없음. `features/zone/api.ts` 에 `getZoneDetail(id)` 추가
  · **#15 채택** (`GET /api/v1/parking/zones`): `ParkingManagement` 의 `useParkingSpots({})` distinct + `useZones()` name 매핑 우회 제거 → `useParkingZones()` 훅 신설. 응답 필드: `{ zoneId, zoneName, zoneType, totalSpots, occupiedSpots }` — Select trigger label 에 보조 정보 노출 가능 ("지하1층 (15면)" 등)

- 비고: #12 (ControlCommandType enum) 는 web `ControlPanel.QUICK_COMMANDS` (AC/LIGHT/FAN/DOOR_LOCK) 가 백엔드 enum value 와 이미 정합 — web 변경 불필요.

- 우선순위: 중 (현재 우회 코드로 동작 가능. 정식 엔드포인트 전환은 시드 ↔ 하드코딩 동기화 부담 해소 + 운영 환경 정합)
- 출처 세션: SmartOffice-server 백엔드 수정 sprint 묶음 3 (2026-05-15)

---

## [2026-05-15] 4. (중) ParkingManagement 차량/예약 UI 신설

- 발생 맥락: SmartOffice-server 백엔드 수정 sprint 묶음 4 (#14 Vehicle + ParkingReservation 엔티티 신설) 완료 (2026-05-15)
- 배경: 플랜 3-3 당시 백엔드 차량/예약 모델 부재로 ParkingManagement 의 차량 의존 코드(vehicles mock · 등록/상세 Dialog · 상태 변경 dropdown · 차량 stats 카드 3종)를 전체 제거했음. 백엔드 sprint 묶음 4 에서 옵션 A 채택으로 정식 모델 신설.
- 신설된 백엔드 엔드포인트:
  · 차량: POST/GET/GET{id}/PUT/DELETE /api/v1/vehicles (VehicleType STAFF|VISITOR, 응답 필드 vehicleId·plateNumber·ownerName·ownerUserId·ownerUserName·vehicleType·purpose)
  · 주차 예약: POST/GET/GET{id}/PUT/DELETE /api/v1/parking/reservations (status RESERVED→PARKED→EXITED, 응답 필드 reservationId·vehicleId·vehiclePlateNumber·zoneId·zoneName·spotId·spotNumber·reservedAt·entryAt·exitAt)
- 권장: src/features/vehicle/ + src/features/parking 의 reservation 관련 신설 → ParkingManagement 에 차량 등록/상세/예약 UI 복원 (기존 mock 패턴 재활용 가능). 차량 stats 카드 3종 복원 — 플랜 3-3 제거 당시: 등록 차량 / 입차 중 / 예약 대기 (정확 명칭은 git log 또는 본 통합 작업 PLAN_3_MASTER 3-3 참조).
- 우선순위: 중 (현재 spot 관리만으로 동작 가능. 차량/예약 운영 기능 복원)
- 출처 세션: SmartOffice-server 백엔드 수정 sprint 묶음 4 (2026-05-15)
- 추적 정합: PLAN_3_MASTER 9절 #8 마감 표기와 1:1 매핑. web sprint 진입 시 본 SUGGESTIONS #4 + 9절 #8 본문 동시 참조 권장.

---

## [2026-05-15] 5. (중) guest(방문객) 도메인 UI 신설 — mock 제거 + 메뉴 복구

- 발생 맥락: SmartOffice-server 백엔드 수정 sprint 묶음 5 #1 (guest 도메인 신설) 완료 (2026-05-15)
- 배경: web `src/components/dashboard/GuestTable.tsx` 가 외주 단계 mock 30+ 건으로 구현되어 있고, 본 통합 작업(플랜 3)에서 백엔드 부재로 사이드바 `/guest` 메뉴를 임시 숨김 + `/guest` 라우트를 대시보드로 리다이렉트 처리했음. 백엔드 sprint 묶음 5 에서 정식 도메인이 신설됨.
- 신설된 백엔드 엔드포인트:
  · POST/GET/GET{id}/PUT/DELETE `/api/v1/guests` (ADMIN)
  · POST `/api/v1/guests/{id}/check-in` · POST `/api/v1/guests/{id}/check-out` (ADMIN)
  · GuestStatus: SCHEDULED → VISITING → COMPLETED, CANCELLED. 체크인은 SCHEDULED, 체크아웃은 VISITING 상태에서만 허용 (그 외 400)
  · 응답 필드: guestId·guestName·company·hostUserId·hostUserName·purpose·contactPhone·guestStatus·scheduledEntryAt·actualEntryAt·actualExitAt·createdAt·updatedAt
  · 목록 필터: status·hostUserId·keyword(이름·회사) + 페이지네이션
- 권장: `src/features/guest/` 4파일 세트 신설 → `GuestTable` mock 제거 후 실 API 연동. 사이드바 `/guest` 메뉴 복구 + 라우트 리다이렉트 해제. 체크인/체크아웃 액션 버튼 (상태별 활성화 — SCHEDULED 일 때 체크인, VISITING 일 때 체크아웃).
- 우선순위: 중 (mock 의존 UI 가 외주 단계부터 존재 — 도입 시 메뉴 즉시 복구)
- 출처 세션: SmartOffice-server 백엔드 수정 sprint 묶음 5 #1 (2026-05-15)

---

## [2026-05-15] 6. (중) Refresh Token httpOnly 쿠키 전환 — web 동반 변경

- 발생 맥락: SmartOffice-server 백엔드 수정 sprint 묶음 5 #2 (Refresh Token httpOnly 쿠키 전환) 완료 (2026-05-15)
- 백엔드 변경:
  · `POST /auth/login` 응답이 `Set-Cookie: refreshToken=...` (HttpOnly · SameSite=Lax · Path=/api/v1/auth) 발급. Access Token 은 기존대로 응답 body.
  · `POST /auth/refresh` 는 쿠키의 refreshToken 을 우선 사용, 부재 시 body 의 `refreshToken` 폴백 — **현재 web 의 body 전송 방식은 폴백으로 당분간 계속 동작** (점진 전환 가능).
  · `POST /auth/logout` 은 쿠키 즉시 만료. CORS `allowCredentials(true)` + 명시적 origin 허용 (로컬 `http://localhost:5173`).
- 현재 web: Access·Refresh Token 모두 `localStorage` 보관 (`tokenStorage.ts`). axios `withCredentials` 미설정 → 쿠키 미전송.
- 권장 web 변경:
  · `src/lib/api/client.ts` axios 인스턴스에 `withCredentials: true` 활성화 → httpOnly 쿠키 자동 송수신.
  · `tokenStorage` 의 `refreshToken` 저장/조회/삭제 제거. login 응답 body 의 `refreshToken` 미사용.
  · 401 refresh 인터셉터의 `/auth/refresh` 호출을 body 없이 호출 (쿠키 자동 첨부).
  · 운영 환경 도메인 통일 시 쿠키 `Domain` 속성 정합 확인.
- 비고: 백엔드가 body 폴백을 유지하므로 web 미변경 상태에서도 현재 로그인/갱신 동작은 유지된다. 단 httpOnly 전환의 XSS 토큰 탈취 완화 효과는 web 측 `withCredentials` + localStorage refreshToken 제거가 완료되어야 발생한다.
- 우선순위: 중 (보안 강화 — XSS 시 Refresh Token 탈취 완화. 동작 회귀는 없음)
- 출처 세션: SmartOffice-server 백엔드 수정 sprint 묶음 5 #2 (2026-05-15)

---

## [2026-05-15] 7. (하~중) 시스템 설정 페이지 — user_preferences API 채택

- 발생 맥락: SmartOffice-server 백엔드 수정 sprint 묶음 5 #3 (user_preferences API 신설) 완료 (2026-05-15)
- 배경: web 사이드바의 "시스템 설정" 라우트가 *준비 중* placeholder 로 유지되어 있음. 사용자별 환경설정(알림·언어·테마·푸시 토큰)을 저장할 백엔드가 부재했음.
- 신설된 백엔드 엔드포인트:
  · GET `/api/v1/users/me/preferences` · PUT `/api/v1/users/me/preferences` (본인, JWT subject 기준)
  · 응답 필드: userId·notificationsEnabled·language·theme·pushToken·updatedAt
  · 설정 행은 최초 조회/수정 시점에 기본값(알림 on · ko · light)으로 lazy 생성. PUT 은 부분 수정 (null 필드는 기존 값 유지).
- 권장: `src/features/userPreferences/` (또는 settings) 4파일 세트 신설 → "시스템 설정" 페이지에서 알림 on/off · 언어 · 테마 토글 UI. TopBar 드롭다운의 시스템 설정 모달도 동일 hook 연동 가능.
- 비고: 다크모드 토글은 본 통합 작업에서 `useUIStore.theme = "light"` 고정 + 토글 UI 미노출 정책이었음 (CLAUDE.md 18절). `theme` preference 가 백엔드에 생겼으므로 다크모드 토글 도입 시 함께 검토 가능.
- 우선순위: 하~중 (현재 placeholder 로 동작에 결함 없음. 시스템 설정 페이지 실구현)
- 출처 세션: SmartOffice-server 백엔드 수정 sprint 묶음 5 #3 (2026-05-15)
