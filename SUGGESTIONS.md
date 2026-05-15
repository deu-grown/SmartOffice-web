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
