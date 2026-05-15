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
