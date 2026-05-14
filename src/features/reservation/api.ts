// 예약(reservation) 도메인 REST API 호출 — ADMIN 1 + cat 5 공용 4 = 5 함수.
// GET /reservations 응답은 PageResponse<ReservationListItem> 래핑.
// GET /zones/{zoneId}/reservations 응답은 ReservationListResponse 직반환.
import { apiDelete, apiGet, apiPut } from "@/src/lib/api/client";
import type { PageResponse } from "@/src/lib/api/types";

import type {
  ReservationListFilter,
  ReservationListItem,
  ReservationListResponse,
  ReservationResponse,
  ReservationUpdateRequest,
} from "./types";

export const reservationApi = {
  /** 전체 예약 목록 [ADMIN] (status / page / size 필터). */
  listAll: (filter?: ReservationListFilter) =>
    apiGet<PageResponse<ReservationListItem>>("/reservations", { params: filter }),
  /** 예약 상세 조회. */
  detail: (id: number) => apiGet<ReservationResponse>(`/reservations/${id}`),
  /** 예약 수정 (본인/ADMIN). 본 web 은 ADMIN 운영 — 타인 예약 강제 수정 가능. */
  update: (id: number, body: ReservationUpdateRequest) =>
    apiPut<ReservationResponse, ReservationUpdateRequest>(`/reservations/${id}`, body),
  /** 예약 취소 (본인/ADMIN). 응답은 취소된 reservationId. */
  cancel: (id: number) => apiDelete<number>(`/reservations/${id}`),
  /** 구역별 예약 현황 (date 미입력 시 오늘). cat 5 — 인증만 요구. */
  zoneReservations: (zoneId: number, date?: string) =>
    apiGet<ReservationListResponse>(`/zones/${zoneId}/reservations`, {
      params: date ? { date } : undefined,
    }),
};
