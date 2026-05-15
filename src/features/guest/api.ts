// 방문객(guest) 도메인 REST API 호출.
import { apiDelete, apiGet, apiPost, apiPut } from "@/src/lib/api/client";

import type {
  GuestCreateRequest,
  GuestFilter,
  GuestListResponse,
  GuestResponse,
  GuestUpdateRequest,
} from "./types";

export const guestApi = {
  /** 방문객 목록 (status · hostUserId · keyword 필터). */
  list: (filter?: GuestFilter) =>
    apiGet<GuestListResponse>("/guests", { params: filter }),
  /** 방문객 단건 조회. */
  detail: (id: number) => apiGet<GuestResponse>(`/guests/${id}`),
  /** 방문객 등록. */
  create: (body: GuestCreateRequest) =>
    apiPost<GuestResponse, GuestCreateRequest>("/guests", body),
  /** 방문객 정보 수정. */
  update: (id: number, body: GuestUpdateRequest) =>
    apiPut<GuestResponse, GuestUpdateRequest>(`/guests/${id}`, body),
  /** 방문객 삭제. */
  remove: (id: number) => apiDelete<void>(`/guests/${id}`),
  /** 체크인 (SCHEDULED → VISITING). */
  checkIn: (id: number) => apiPost<GuestResponse>(`/guests/${id}/check-in`),
  /** 체크아웃 (VISITING → COMPLETED). */
  checkOut: (id: number) => apiPost<GuestResponse>(`/guests/${id}/check-out`),
};
