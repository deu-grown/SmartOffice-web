// 예약(reservation) 도메인 타입 — 백엔드 com.grown.smartoffice.domain.reservation.dto 와 1:1 매핑.
// 본 web 통합 범위는 ADMIN 운영 + cat 5 공용 5종. 모바일 전용 3종(POST /reservations, GET /reservations/me,
// POST /reservations/{id}/check-in) 은 web 미사용.

/** 백엔드 ReservationStatus enum (4종). */
export type ReservationStatus = "CONFIRMED" | "CANCELLED" | "NO_SHOW" | "CHECKED_IN";

/** GET /api/v1/reservations/{id} 응답 = ReservationResponse. */
export interface ReservationResponse {
  reservationId: number;
  zoneName: string;
  userName: string;
  startTime: string; // ISO LocalDateTime
  endTime: string;
  purpose: string;
  status: ReservationStatus;
  checkInTime: string | null;
}

/** GET /api/v1/reservations (ADMIN) PageResponse content 요소. */
export interface ReservationListItem {
  id: number;
  userName: string;
  zoneName: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
}

/** GET /api/v1/zones/{zoneId}/reservations 응답 = ReservationListResponse. */
export interface ReservationListResponse {
  totalCount: number;
  reservationList: ReservationListItem[];
}

/** PUT /api/v1/reservations/{id} 요청. 모든 필드 optional. */
export interface ReservationUpdateRequest {
  startTime?: string;
  endTime?: string;
  purpose?: string;
}

/** GET /api/v1/reservations (ADMIN) 쿼리 필터. */
export interface ReservationListFilter {
  status?: ReservationStatus;
  page?: number;
  size?: number;
}
