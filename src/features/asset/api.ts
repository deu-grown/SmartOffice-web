// 자산(asset) 도메인 REST API 호출. ADMIN 5 엔드포인트 (POST/GET/GET-id/PUT/DELETE).
// GET /api/v1/assets 응답은 PageResponse 래핑 (백엔드 PageResponse — Spring Page 가 아닌 custom record).
import { apiDelete, apiGet, apiPost, apiPut } from "@/src/lib/api/client";
import type { PageResponse } from "@/src/lib/api/types";

import type {
  AssetCreateRequest,
  AssetListFilter,
  AssetResponse,
  AssetUpdateRequest,
} from "./types";

export const assetApi = {
  /** 자산 목록 (페이지네이션·필터). */
  list: (filter?: AssetListFilter) =>
    apiGet<PageResponse<AssetResponse>>("/assets", { params: filter }),
  /** 자산 상세. */
  detail: (id: number) => apiGet<AssetResponse>(`/assets/${id}`),
  /** 자산 등록. */
  create: (body: AssetCreateRequest) =>
    apiPost<AssetResponse, AssetCreateRequest>("/assets", body),
  /** 자산 정보 수정. */
  update: (id: number, body: AssetUpdateRequest) =>
    apiPut<AssetResponse, AssetUpdateRequest>(`/assets/${id}`, body),
  /** 자산 삭제. */
  remove: (id: number) => apiDelete<void>(`/assets/${id}`),
};
