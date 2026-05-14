// 구역(zone) 도메인 REST API 호출.
// 5 함수 (목록·트리·등록·수정·삭제). GET /{id} 엔드포인트는 백엔드 부재 — useZoneDetail(id) 는 useZones() find 우회.
// 백엔드 채택 시 detail(id) 추가 후 hook 내부만 swap (queryKey 그대로). 9절 결함 #4 / BACKEND_SUGGESTIONS #10 참조.
import { apiDelete, apiGet, apiPost, apiPut } from "@/src/lib/api/client";

import type {
  ZoneCreateRequest,
  ZoneCreateResponse,
  ZoneListFilter,
  ZoneListItem,
  ZoneTreeNode,
  ZoneUpdateRequest,
  ZoneUpdateResponse,
} from "./types";

export const zoneApi = {
  /** 구역 목록 (parentId·zoneType 필터 가능). */
  list: (filter?: ZoneListFilter) =>
    apiGet<ZoneListItem[]>("/zones", { params: filter }),
  /** 구역 트리 (재귀 children). 메뉴/계층 탐색 용도. */
  tree: () => apiGet<ZoneTreeNode[]>("/zones/tree"),
  /** 구역 등록. */
  create: (body: ZoneCreateRequest) =>
    apiPost<ZoneCreateResponse, ZoneCreateRequest>("/zones", body),
  /** 구역 수정 (이름·타입·상위 변경). clearParent=true 와 parentId=null 조합으로 최상위 변경. */
  update: (id: number, body: ZoneUpdateRequest) =>
    apiPut<ZoneUpdateResponse, ZoneUpdateRequest>(`/zones/${id}`, body),
  /** 구역 삭제 — 하위 구역 또는 설치 장치 존재 시 백엔드 409. */
  remove: (id: number) => apiDelete<void>(`/zones/${id}`),
};
