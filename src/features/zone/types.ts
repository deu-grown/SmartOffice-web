// 구역(zone) 도메인 타입 — 백엔드 DTO 와 1:1 매핑.
// 백엔드 ZoneType enum: FLOOR | AREA | ROOM (계층 구조 표시용. 권한 카테고리 모델은 백엔드에 존재하지 않음.)

/** 백엔드 ZoneType enum 정합. UI 표시 라벨은 zone-type 헬퍼에서 매핑. */
export type ZoneType = "FLOOR" | "AREA" | "ROOM";

/** GET /api/v1/zones 목록 응답 항목 (1:1).
 *  GET /{id} 엔드포인트는 백엔드에 부재 — useZoneDetail(id) 는 본 응답을 find(id) 로 클라이언트 우회.
 *  (BACKEND_SUGGESTIONS #10 채택 시 useQuery 로 swap.) */
export interface ZoneListItem {
  id: number;
  name: string;
  zoneType: ZoneType;
  parentId: number | null;
  description: string | null;
  createdAt: string; // ISO LocalDateTime
}

/** GET /api/v1/zones/tree 응답 노드 (재귀). parentId/createdAt 누락 — 메뉴/계층 탐색 용도. */
export interface ZoneTreeNode {
  id: number;
  name: string;
  zoneType: ZoneType;
  description: string | null;
  children: ZoneTreeNode[];
}

/** POST /api/v1/zones 요청. */
export interface ZoneCreateRequest {
  name: string;
  zoneType: ZoneType;
  parentId?: number | null;
  description?: string | null;
}

/** POST /api/v1/zones 응답 (= ZoneListItem 필드 셋과 동일하나 별도 응답 DTO). */
export interface ZoneCreateResponse {
  id: number;
  name: string;
  zoneType: ZoneType;
  parentId: number | null;
  description: string | null;
  createdAt: string;
}

/** PUT /api/v1/zones/{id} 요청. clearParent=true 와 parentId=null 조합으로 최상위 변경. */
export interface ZoneUpdateRequest {
  name?: string;
  zoneType?: ZoneType;
  parentId?: number | null;
  /** parentId 변경 의도를 명시적으로 전달. parentId 만 보내면 변경 의도 X 와 구분 불가. */
  clearParent?: boolean;
  description?: string | null;
}

/** PUT /api/v1/zones/{id} 응답. */
export interface ZoneUpdateResponse {
  id: number;
  name: string;
  zoneType: ZoneType;
  parentId: number | null;
  description: string | null;
  updatedAt: string;
}

/** GET /api/v1/zones 쿼리 필터. */
export interface ZoneListFilter {
  parentId?: number;
  zoneType?: ZoneType;
}
