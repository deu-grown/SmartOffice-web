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
