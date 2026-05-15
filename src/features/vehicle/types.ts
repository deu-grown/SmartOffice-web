// 차량(vehicle) 도메인 타입 — 백엔드 com.grown.smartoffice.domain.vehicle.dto 와 1:1 매핑.

export type VehicleType = "STAFF" | "VISITOR";

/** GET /api/v1/vehicles 목록 응답 항목 / 단건 응답. */
export interface VehicleResponse {
  vehicleId: number;
  plateNumber: string;
  ownerName: string;
  ownerUserId: number | null;
  ownerUserName: string | null;
  vehicleType: VehicleType;
  purpose: string | null;
}

/** GET /api/v1/vehicles 목록 응답. */
export interface VehicleListResponse {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  vehicles: VehicleResponse[];
}

/** POST /api/v1/vehicles 요청. */
export interface VehicleCreateRequest {
  plateNumber: string;
  vehicleType: VehicleType;
  ownerName: string;
  ownerUserId?: number | null;
  purpose?: string | null;
}

/** PUT /api/v1/vehicles/{id} 요청 (부분 수정). */
export interface VehicleUpdateRequest {
  plateNumber?: string;
  vehicleType?: VehicleType;
  ownerName?: string;
  purpose?: string | null;
}

/** GET /api/v1/vehicles 쿼리 파라미터. */
export interface VehicleFilter {
  vehicleType?: VehicleType;
  keyword?: string;
  page?: number;
  size?: number;
}
