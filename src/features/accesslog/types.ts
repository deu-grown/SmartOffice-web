// 백엔드 com.grown.smartoffice.domain.accesslog.dto 패키지와 1:1 매핑.

// authResult 가능 값 — PR #28 V9 마이그레이션 후 ALLOW 폐기, APPROVED/DENIED/BLOCKED 만 유효.
export type AccessLogAuthResult = "APPROVED" | "DENIED" | "BLOCKED";

/** AccessLogResponse 단건 — GET /access-logs / GET /users/{id}/access-logs 공통. */
export interface AccessLog {
  id: number;
  userId: number | null;
  userName: string | null;
  employeeNumber: string | null;
  uid: string | null;
  deviceId: number;
  deviceName: string;
  zoneId: number;
  zoneName: string;
  direction: string;
  authResult: string;
  denyReason: string | null;
  taggedAt: string;
}

/** AllAccessLogListResponse — GET /api/v1/access-logs 응답. */
export interface AllAccessLogList {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  logs: AccessLog[];
}

/** UserAccessLogListResponse — GET /api/v1/users/{id}/access-logs 응답. */
export interface UserAccessLogList {
  userId: number;
  userName: string;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  logs: AccessLog[];
}

/** GET /api/v1/access-logs 쿼리 파라미터 (8 필터). */
export interface AccessLogFilter {
  zoneId?: number;
  userId?: number;
  authResult?: string;
  direction?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

/** GET /api/v1/users/{id}/access-logs 쿼리 파라미터. */
export interface UserAccessLogsQuery {
  startDate?: string;
  endDate?: string;
  zoneId?: number;
  direction?: string;
  page?: number;
  size?: number;
}
