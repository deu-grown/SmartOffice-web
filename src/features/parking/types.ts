// 주차(parking) 도메인 타입 — 백엔드 com.grown.smartoffice.domain.parking.dto 와 1:1 매핑.
// SpotType: REGULAR|DISABLED|EV / SpotStatus: ACTIVE|INACTIVE.
// 차량(Vehicle)/예약(Reservation) 모델은 백엔드 부재 — BACKEND_SUGGESTIONS #14 (저~중).

export type SpotType = "REGULAR" | "DISABLED" | "EV";
export type SpotStatus = "ACTIVE" | "INACTIVE";

/** GET /api/v1/parking/spots · POST/PUT 응답 (1:1). */
export interface ParkingSpotResponse {
  spotId: number;
  zoneId: number;
  zoneName: string;
  spotNumber: string;
  spotType: SpotType;
  deviceId: number | null;
  deviceName: string | null;
  positionX: number | null;
  positionY: number | null;
  occupied: boolean;
  spotStatus: SpotStatus;
  createdAt: string; // ISO LocalDateTime
  updatedAt: string; // ISO LocalDateTime
}

/** POST /api/v1/parking/spots 요청. zoneId/spotNumber/spotType 필수. */
export interface ParkingSpotCreateRequest {
  zoneId: number;
  spotNumber: string;
  spotType: SpotType;
  deviceId?: number | null;
  positionX?: number | null;
  positionY?: number | null;
  /** 미지정 시 서비스 기본값 ACTIVE. */
  spotStatus?: SpotStatus;
}

/** PUT /api/v1/parking/spots/{spotId} 요청 (모든 필드 optional). */
export interface ParkingSpotUpdateRequest {
  spotNumber?: string;
  spotType?: SpotType;
  deviceId?: number | null;
  positionX?: number | null;
  positionY?: number | null;
  spotStatus?: SpotStatus;
}

/** GET /api/v1/parking/spots 쿼리 필터. */
export interface ParkingSpotsFilter {
  zoneId?: number;
  spotType?: SpotType;
  status?: SpotStatus;
}

/** GET /api/v1/parking/zones/{zoneId}/spots 응답 (구역별 요약 + spot 리스트). */
export interface ParkingZoneSummaryResponse {
  zoneId: number;
  zoneName: string;
  totalSpots: number;
  occupiedSpots: number;
  availableSpots: number;
  spots: ParkingSpotResponse[];
}

/** GET /api/v1/parking/zones/{zoneId}/map 응답의 spot 항목 (좌표 + 점유). */
export interface ParkingSpotMapResponse {
  spotId: number;
  spotNumber: string;
  spotType: SpotType;
  positionX: number | null;
  positionY: number | null;
  occupied: boolean;
}

/** GET /api/v1/parking/zones/{zoneId}/map 응답 (좌표 기반 평면도). */
export interface ParkingZoneMapResponse {
  zoneId: number;
  zoneName: string;
  spots: ParkingSpotMapResponse[];
}
