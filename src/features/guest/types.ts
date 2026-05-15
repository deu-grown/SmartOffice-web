// 방문객(guest) 도메인 타입 — 백엔드 com.grown.smartoffice.domain.guest.dto 와 1:1 매핑.
// GuestStatus 상태 전이: SCHEDULED → (check-in) → VISITING → (check-out) → COMPLETED | CANCELLED.

export type GuestStatus = "SCHEDULED" | "VISITING" | "COMPLETED" | "CANCELLED";

/** GET /api/v1/guests 목록 응답 항목 / GET /api/v1/guests/{id} 단건 응답. */
export interface GuestResponse {
  guestId: number;
  guestName: string;
  company: string;
  hostUserId: number;
  hostUserName: string;
  purpose: string;
  contactPhone: string | null;
  guestStatus: GuestStatus;
  scheduledEntryAt: string; // ISO LocalDateTime
  actualEntryAt: string | null;
  actualExitAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/v1/guests 목록 페이지 응답. */
export interface GuestListResponse {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  guests: GuestResponse[];
}

/** POST /api/v1/guests 요청. */
export interface GuestCreateRequest {
  guestName: string;
  company: string;
  hostUserId: number;
  purpose: string;
  contactPhone?: string | null;
  scheduledEntryAt: string; // ISO LocalDateTime
}

/** PUT /api/v1/guests/{id} 요청 (부분 수정). */
export interface GuestUpdateRequest {
  guestName?: string;
  company?: string;
  purpose?: string;
  contactPhone?: string | null;
  scheduledEntryAt?: string;
}

/** GET /api/v1/guests 쿼리 파라미터. */
export interface GuestFilter {
  status?: GuestStatus;
  hostUserId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}
