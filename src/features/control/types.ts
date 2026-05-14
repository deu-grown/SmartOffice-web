// 제어(control) 도메인 타입 — 백엔드 DTO 와 1:1 매핑.
// ControlStatus enum: PENDING | COMPLETED | FAILED. 3 ADMIN 엔드포인트 (cat 2).

export type ControlStatus = "PENDING" | "COMPLETED" | "FAILED";

/** POST /api/v1/controls 요청. */
export interface ControlRequest {
  zoneId: number;
  deviceId: number;
  command: string;
  value?: string;
}

/** POST /api/v1/controls 응답. */
export interface ControlResponse {
  controlId: number;
}

/** GET /api/v1/controls/{id} 상세 응답. */
export interface ControlDetail {
  controlId: number;
  status: ControlStatus;
  requestTime: string;
  resultMessage: string | null;
}

/** GET /api/v1/controls (history) 응답 항목. */
export interface ControlHistoryItem {
  id: number;
  deviceId: number;
  command: string;
  status: ControlStatus;
  requestTime: string;
}

/** GET /api/v1/controls (history) 응답. */
export interface ControlHistoryResponse {
  searchQuery: { [k: string]: unknown };
  totalCount: number;
  controlList: ControlHistoryItem[];
}
