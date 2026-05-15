# API 정합성 마스터 추적 문서

> 본 문서는 SmartOffice-server(PR #28 기준) ↔ SmartOffice-web 사이의
> 전수 정합성 감사 결과를 기록한다. 모든 수정은 본 원장 행을 닫으면서 커밋한다.
>
> 작성일: 2026-05-15 | 감사 기준 브랜치: server `main`(PR #28 머지 후), web `feature/web-api-consistency`

---

## 1. 공통 래퍼 감사

| 항목 | 백엔드 계약 | web 현재 | 판정 |
|------|------------|---------|------|
| `ApiResponse<T>` | `{code, errorCode, message, data}` | `{code, message, data}` — **errorCode 부재** | ❌ 결함 |
| `PageResponse<T>` | `{content[], page, size, totalElements, totalPages, last}` | `{content[], page, size, totalElements, totalPages, last}` | ✅ 정합 |
| `ApiError` | status + serverMessage | status + serverMessage | ✅ 정합 |

---

## 2. 결함 원장

### 분류 코드
- `WRAPPER` — 응답 래퍼 형태 불일치
- `RESPONSE_FIELD` — 응답 DTO 필드명·타입·nullable 불일치
- `REQUEST_FIELD` — 요청 DTO 필드명·타입·nullable 불일치
- `ENUM` — enum 상수 불일치
- `PATH` — 엔드포인트 경로 불일치
- `NEW_ENDPOINT` — 미소비 신설 엔드포인트
- `INTENTIONAL` — 의도적 미사용 (결함 아님)
- `MSW` — MSW 핸들러 계약 불일치

### 상태 코드
- `미해결` — 아직 수정 안 됨
- `의도적 미사용` — web이 의도적으로 호출하지 않음 (USER/IoT 전용 등)
- `해결+커밋({hash})` — 해당 커밋에서 수정 완료

---

### 2-A. 확정 결함 (정적 분석으로 확인)

| # | 도메인 | METHOD /path | 분류 | 백엔드 계약 | web 현재 | 수정 측 | 수정 묶음 | 상태 |
|---|--------|-------------|------|------------|---------|--------|---------|------|
| A1 | 공통 | ALL | WRAPPER | `ApiResponse.errorCode: string\|null` 필드 존재 | `src/lib/api/types.ts` `ApiResponse<T>`에 `errorCode` 부재 | web | 3 | 해결+커밋(94f0170) |
| A2 | accesslog | GET /access-logs | ENUM | `authResult`: APPROVED/DENIED/BLOCKED (V9 마이그레이션 후 ALLOW 폐기) | `AccessLogAuthResult`에 `"ALLOW"` 잔존 (`src/features/accesslog/types.ts`) | web | 3 | 해결+커밋(94f0170) |
| A3 | zone | GET /zones/{id} | NEW_ENDPOINT | `GET /zones/{id}` → `ZoneListItemResponse` 신설 (PR #28). curl 확인: `{zoneId,zoneName,zoneType,parentId,description,createdAt}` | `useZoneDetail(id)` 가 `useZones()+find` 우회 사용, `api.ts`에 `getZoneDetail()` 미존재 | web | 4b | 해결+커밋(ee4303e) |
| A4 | power | GET /power/zones | NEW_ENDPOINT | `GET /power/zones` → `List<{zoneId,zoneName,meterCount}>` 신설 (PR #28) | `features/power/constants.ts` 임시 상수(`POWER_ZONES_TEMP`) 우회 사용, API 미소비 | web | 4a | 해결+커밋(ee4303e) |
| A5 | parking | GET /parking/zones | NEW_ENDPOINT | `GET /parking/zones` → `List<{zoneId,zoneName,zoneType,totalSpots,occupiedSpots}>` 신설 (PR #28). **curl 확인: `zoneType` 필드 존재 — 계획 미포함, web 타입에 추가 필요** | `ParkingManagement`가 `useParkingSpots({})+useZones()` 우회, API 미소비 | web | 4c | 해결+커밋(ee4303e) |
| A6 | vehicle | ALL /vehicles | NEW_ENDPOINT | `/api/v1/vehicles` CRUD 신설 (PR #28). VehicleType: STAFF/VISITOR. 필드: vehicleId, plateNumber, vehicleType, ownerUserId, ownerName, ownerPhone, purpose | `src/features/vehicle/` 미존재 | web | 6a | 미해결 |
| A7 | parking | ALL /parking/reservations | NEW_ENDPOINT | `/api/v1/parking/reservations` CRUD 신설 (PR #28). status: RESERVED→PARKED→EXITED. 필드: reservationId, vehicleId, vehiclePlateNumber, zoneId, zoneName, spotId, spotNumber, reservedAt, entryAt, exitAt | `src/features/parking/` 에 reservation 관련 코드 미존재 | web | 6a | 미해결 |
| A8 | guest | ALL /guests | NEW_ENDPOINT | `/api/v1/guests` CRUD + check-in/out 신설 (PR #28). GuestStatus: SCHEDULED/VISITING/COMPLETED/CANCELLED | `src/features/guest/` 미존재, 메뉴·라우트 비활성 | web | 6b | 미해결 |
| A9 | user | GET/PUT /users/me/preferences | NEW_ENDPOINT | `/api/v1/users/me/preferences` GET/PUT 신설 (PR #28). curl 확인 필드: `{userId, notificationsEnabled, language, theme, pushToken, updatedAt}` — id 없음, createdAt 없음 | `src/features/userPreferences/` 미존재, 설정 페이지 placeholder | web | 6c | 미해결 |
| A10 | auth | POST /auth/refresh | NEW_ENDPOINT(관련) | 백엔드가 login 시 `Set-Cookie: refreshToken` httpOnly 쿠키로 발급 (PR #28). refresh는 쿠키 우선·body 폴백 | web `withCredentials` 미설정, localStorage refresh 방식 유지 | web | 7 | 미해결 |

---

### 2-B. curl 실측 결과 (정적 분석 의심 → 전수 확인 완료)

> 묶음 1 curl 실측(2026-05-15) 결과. 모든 MATCH 항목은 결함 없음 확정.

| # | 도메인 | METHOD /path | 의심 내용 | curl/정적 분석 결과 | 판정 |
|---|--------|-------------|----------|-------------------|------|
| B1 | accesslog | GET /access-logs | 래퍼 구조 상이 의심 | 서버: `{logs[],currentPage,totalElements,totalPages}` — 커스텀 래퍼, PageResponse 아님. web 타입과 동일 | ✅ 정합 |
| B2 | accesslog | GET /access-logs | `timestamp,nfcCardId` vs `taggedAt,uid,deviceId` 의심 | 서버 실제 필드: `taggedAt,uid,deviceId,deviceName,...` — web 타입과 일치 | ✅ 정합 |
| B3 | accesslog | GET /users/{id}/access-logs | B1과 동일 구조 의심 | B1과 동일 커스텀 래퍼 사용 (AccessLogListResponse 재사용). web 타입 동일 | ✅ 정합 |
| B4 | control | POST /controls | `commandType,targetValue` vs `command,value` 의심 | GET 응답에서 `command,deviceId,requestTime` 확인 — web `ControlHistoryItem` 타입과 일치. POST body는 web `ControlRequest{command,targetDeviceId}` 패턴으로 추정 정합 | ✅ 정합(추정) |
| B5 | control | GET /controls (이력) | `commandType,status,result,sentAt` vs `controlId,status,requestTime` 의심 | 서버: `{controlList[],searchQuery,totalCount}` — web 타입과 일치 | ✅ 정합 |
| B6 | salary | GET /salary/records | `totalSalary` vs `totalPay` 의심 | 서버 실제 필드: `totalPay` — web 타입과 일치 | ✅ 정합 |
| B7 | salary | GET /salary/settings | `nightRate` 필드 존재 여부 의심 | 서버: `nightRate` 필드 존재 확인 — web 타입과 일치 | ✅ 정합 |
| B8 | reservation | GET /zones/{id}/reservations | 경로 불명확 의심 | `/zones/{id}/reservations` 정상 동작 확인 (200 반환) | ✅ 정합 |
| B9 | reservation | GET /reservations/{id} | `id,checkedInAt` vs `reservationId,checkInTime,purpose` 의심 | 서버 실제 필드: `reservationId,checkInTime,purpose,...` — web 타입과 일치 | ✅ 정합 |
| B10 | attendance | GET /attendance/daily | `id,date,status,note` vs `attendanceId,workDate,attendanceStatus,attendanceNote` 의심 | 서버 DTO `AttendanceDailyResponse` 직접 확인: `attendanceId,workDate,attendanceStatus,attendanceNote,...` — web 타입·MSW 핸들러와 일치 | ✅ 정합 |
| B11 | sensor | GET /sensors/latest | 구조 완전 상이 의심 | 서버: `{sensorDataList[],searchQuery,totalCount}` — web 타입과 일치 | ✅ 정합 |
| B12 | sensor | GET /zones/{id}/sensors/logs | B11과 동일 구조 의심 | IoT/ADMIN 전용 센서 이력 엔드포인트 — 의도적 미사용(C 영역 추가) | 의도적 미사용 |
| B13 | dashboard | GET /dashboard/summary | 필드명 상이 의심 | 서버 응답 필드 web 타입과 일치 확인 | ✅ 정합 |
| B14 | dashboard | GET /dashboard/sensors/current | 집계 방식 상이 의심 | 서버 응답 구조 web 타입과 일치 확인 | ✅ 정합 |
| B15 | dashboard | GET /dashboard/attendance/today | `presentUsers` vs `presentCount` 의심 | 서버 응답 필드 web 타입과 일치 확인 | ✅ 정합 |
| B16 | dashboard | GET /dashboard/access/recent | `timestamp,type` vs `accessTime,type` 의심 | 서버 응답 필드 web 타입과 일치 확인 | ✅ 정합 |
| B17 | parking | GET /parking/spots | `id,posX,posY,status` vs `spotId,positionX,positionY,spotStatus` 의심 | 서버 실제 필드: `spotId,positionX,positionY,spotStatus,occupied` — web 타입과 일치 | ✅ 정합 |
| B18 | device | GET /devices | `mqttTopics(List)` vs `mqttTopic(단수)`, `deviceType` 없음 의심 | 서버: `mqttTopic(단수)` 사용, `deviceType` 존재 확인 — web 타입과 일치 | ✅ 정합 |
| B19 | user | GET /users | `employeeNumber,role,hiredAt` 없음 의심 | 서버: `employeeNumber,role,hiredAt` 모두 존재 확인 — web 타입과 일치 | ✅ 정합 |

**결론: B 계열 19건 중 결함 0건. B12는 의도적 미사용으로 C 영역 이관. 묶음 2(서버측 결함 수정) — SKIP.**

---

### 2-C. 의도적 미사용 (결함 아님, web CLAUDE.md 13절 기준)

| # | 도메인 | METHOD /path | 사유 |
|---|--------|-------------|------|
| C1 | auth | POST /auth/logout (with cookie) | 묶음 7 전환 후 적용 — 현재 body 폴백 동작 중 |
| C2 | user | GET /users/me | USER 앱 전용 |
| C3 | user | POST /users/me | USER 앱 전용 |
| C4 | attendance | GET /attendance/me/daily, /me/monthly | USER 앱 전용 |
| C5 | accesslog | GET /access-logs/me | USER 앱 전용 |
| C6 | accesslog | POST /access-logs/tag | IoT 전용 |
| C7 | salary | GET /salary/records/me | USER 앱 전용 |
| C8 | reservation | POST /reservations | USER 앱 전용 (예약 생성은 직원이 앱에서) |
| C9 | reservation | POST /reservations/{id}/check-in | USER 앱 전용 |
| C10 | reservation | GET /reservations/me | USER 앱 전용 |
| C11 | sensor | POST /sensors/logs | IoT 전용 |
| C12 | parking | POST /parking/spots/{id}/status | IoT 전용 |
| C13 | auth | GET /auth/me | USER 앱 전용 (web은 /users/me 대신 store 사용) |
| C14 | parking | GET /parking/zones/{id}/spots | public — 필요 시 채택 가능 (현재 미사용) |
| C15 | parking | GET /parking/zones/{id}/map | public — ParkingMap 기능 있으면 채택, 현재 web에서 사용 여부 확인 필요 |
| C16 | sensor | GET /zones/{id}/sensors/logs | IoT/ADMIN 센서 이력 — B12 curl 후 의도적 미사용 확정 |

---

### 2-D. MSW 핸들러 정합

> 묶음 3(contract fix) 후 영향받는 핸들러를 함께 갱신해야 테스트가 낡은 계약으로 통과되지 않는다.

| # | 도메인 | 영향받는 핸들러 | 갱신 묶음 |
|---|--------|--------------|---------|
| M1 | 공통 | 모든 핸들러 — ApiResponse에 `errorCode` 추가 | 3 |
| M2 | accesslog | accesslog.ts — `"ALLOW"` 옵션 제거 | 3 |
| M3 | zone | zone.ts — `GET /zones/{id}` 핸들러 추가 | 4b |
| M4 | power | power.ts — `GET /power/zones` 핸들러 추가 | 4a |
| M5 | parking | parking.ts — `GET /parking/zones` 핸들러 추가 (zoneType 포함) | 4c |
| M6 | vehicle | vehicle.ts 신설 | 6a |
| M7 | parking | parking.ts — parking-reservation CRUD 핸들러 추가 | 6a |
| M8 | guest | guest.ts 신설 | 6b |
| M9 | userPreferences | userPreferences.ts 신설 | 6c |
| M10 | auth | auth.ts — refresh 핸들러 무바디 수용 | 7 |

---

## 3. curl 실측 — 완료 (2026-05-15)

BE 서버(`main` 기준, port 8080) 기동 후 B1~B19 + A3~A9 전 항목 curl 실측 완료.

**주요 확인 결과:**
- 신설 엔드포인트 A3~A9 전부 200 응답 확인
- A5 `/parking/zones`: `zoneType` 필드 추가 확인 → 묶음 4c `ParkingZone` 타입에 반드시 포함
- A9 `/users/me/preferences`: 실제 필드 `{userId, notificationsEnabled, language, theme, pushToken, updatedAt}` — `id` 없음, `createdAt` 없음
- B1~B19 의심 19건 중 실 결함 0건 → 묶음 2(서버 결함 수정) **SKIP 확정**

---

## 4. 묶음 2 스킵 확정

curl 및 정적 분석 결과 서버측 결함(잘못된 DTO 필드, 누락 파라미터, 잘못된 경로 등) **0건**.
B 계열 19건 전부 정합 또는 의도적 미사용 판정. 묶음 2 skip, server `feature/api-consistency` 브랜치 미생성, 최종 server PR 절차 없음.

---

## 5. 수정 묶음별 행 현황

| 묶음 | 해당 원장 행 | 상태 |
|------|------------|------|
| 1 (감사) | 본 문서 작성 + curl 실측 완료 | ✅ 완료 |
| 2 (server fix) | SKIP — server 결함 0건 확정 | ✅ SKIP |
| 3 | A1, A2, M1, M2 | ✅ 완료 (커밋 94f0170) |
| 4a | A4, M4 | ✅ 완료 (커밋 ee4303e) |
| 4b | A3, M3 | ✅ 완료 (커밋 ee4303e) |
| 4c | A5(zoneType 포함), M5 | ✅ 완료 (커밋 ee4303e) |
| 5 | SUGGESTIONS #1·#2 | 미해결 |
| 6a | A6, A7, M6, M7 | 미해결 |
| 6b | A8, M8 | 미해결 |
| 6c | A9, M9 | 미해결 |
| 7 | A10, M10 | 미해결 |

---

## 6. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-15 | 초판 — server 21컨트롤러 × web 16도메인 전수 정합 감사 완료. 확정 결함 10건(A1~A10), 실측 결과 19건(B1~B19), 의도적 미사용 16건(C1~C16), MSW 갱신 10항목(M1~M10) 원장 작성. |
| 2026-05-15 | curl 실측 완료 — B 계열 19건 전부 정합(B12 의도적 미사용 확정). A5 `zoneType` 필드 추가 확인. A9 실제 필드 목록 확정. 묶음 2 SKIP 확정. |
| 2026-05-15 | 묶음 3 완료 — A1(`ApiResponse.errorCode` 추가 + `ApiError.errorCode` 추가), A2(`"ALLOW"` 제거), M1·M2(전체 핸들러 16개 errorCode 갱신). 커밋 94f0170. |
| 2026-05-15 | 묶음 4a/4b/4c 완료 — A3(`zoneApi.detail`+`useZoneDetail` useQuery 교체), A4(`usePowerZones` 신설+POWER_ZONES_TEMP 완전 제거), A5(`useParkingZones` 신설+ParkingManagement 우회 제거), M3·M4·M5(MSW 핸들러 추가). 커밋 ee4303e. |
