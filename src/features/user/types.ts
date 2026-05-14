// 백엔드 com.grown.smartoffice.domain.user.dto / accesslog.dto 패키지와 1:1 매핑.
// 인터셉터에서 ApiResponse<T> 의 data 만 언래핑되어 내려오므로 unwrapped 모양만 정의.

/** GET /api/v1/users 페이지 단건 (UserListItemResponse). */
export interface UserListItem {
  id: number;
  employeeNumber: string;
  name: string;
  email: string;
  role: string;
  position: string;
  department: string | null;
  phone: string | null;
  status: string;
  hiredAt: string;
}

/** GET /api/v1/users/{id} 응답 (UserDetailResponse). */
export interface UserDetail extends UserListItem {
  createdAt: string;
  updatedAt: string;
}

/** GET /api/v1/users 쿼리 파라미터. */
export interface UserListFilter {
  departmentId?: number;
  status?: string;
  keyword?: string;
  page?: number;
  size?: number;
}

/** POST /api/v1/users 요청 (UserCreateRequest). */
export interface UserCreateRequest {
  employeeNumber: string;
  name: string;
  email: string;
  role: string;
  position: string;
  departmentId: number;
  phone?: string;
  hiredAt: string;
}

/** POST /api/v1/users 응답 (UserCreateResponse). */
export interface UserCreateResponse {
  id: number;
  employeeNumber: string;
  name: string;
  email: string;
  role: string;
  position: string;
  department: string | null;
  status: string;
  hiredAt: string;
  createdAt: string;
}

/** PUT /api/v1/users/{id} 요청 (UserUpdateRequest). */
export interface UserUpdateRequest {
  name?: string;
  role?: string;
  position?: string;
  departmentId?: number;
  phone?: string;
  hiredAt?: string;
}

/** PUT /api/v1/users/{id} 응답 (UserUpdateResponse). */
export interface UserUpdateResponse {
  id: number;
  name: string;
  role: string;
  position: string;
  department: string | null;
  phone: string | null;
  updatedAt: string;
}

// 출입 이력 — C9 에서 features/accesslog 로 이관 예정 (임시 inline 정의).
/** AccessLogResponse 단건. */
export interface UserAccessLog {
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

/** GET /api/v1/users/{id}/access-logs 응답 (UserAccessLogListResponse). */
export interface UserAccessLogList {
  userId: number;
  userName: string;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  logs: UserAccessLog[];
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
