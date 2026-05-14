// 백엔드 com.grown.smartoffice.domain.department.dto 패키지와 1:1 매핑.
// 인터셉터에서 ApiResponse<T> 의 data 만 언래핑되어 내려오므로 unwrapped 모양만 정의.

/** GET /api/v1/departments 응답의 단건. */
export interface Department {
  id: number;
  name: string;
  description: string | null;
  userCount: number;
  createdAt: string;
}

/** POST /api/v1/departments 요청. */
export interface DepartmentCreateRequest {
  name: string;
  description?: string;
}

/** POST /api/v1/departments 응답. */
export interface DepartmentCreateResponse {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

/** PUT /api/v1/departments/{id} 요청. */
export interface DepartmentUpdateRequest {
  name: string;
  description?: string;
}

/** PUT /api/v1/departments/{id} 응답. */
export interface DepartmentUpdateResponse {
  id: number;
  name: string;
  description: string | null;
  updatedAt: string;
}
