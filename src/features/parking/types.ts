// 주차(parking) 도메인 타입 — 백엔드 com.grown.smartoffice.domain.parking.dto 와 1:1 매핑.
// SpotType: REGULAR|DISABLED|EV / SpotStatus: ACTIVE|INACTIVE.
// ParkingReservation 모델: 묶음 6a (백엔드 sprint #14 채택) 에서 추가.

import type { ZoneType } from "@/src/features/zone/types";

export type SpotType = "REGULAR" | "DISABLED" | "EV";
export type SpotStatus = "ACTIVE" | "INACTIVE";

/** GET /api/v1/parking/zones 응답 항목 — 주차면 보유 구역 목록. */
export interface ParkingZoneItem {
  zoneId: number;
  zoneName: string;
  zoneType: ZoneType;
  totalSpots: number;
  occupiedSpots: number;
}

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

// ── 주차 예약 (ParkingReservation) ─────────────────────────────────────

export type ReservationStatus = "RESERVED" | "PARKED" | "EXITED";

/** GET /api/v1/parking/reservations 목록 응답 항목 / 단건 응답. */
export interface ParkingReservationResponse {
  reservationId: number;
  vehicleId: number;
  vehiclePlateNumber: string;
  zoneId: number;
  zoneName: string;
  spotId: number | null;
  spotNumber: string | null;
  reservedAt: string; // ISO LocalDateTime
  entryAt: string | null;
  exitAt: string | null;
  status: ReservationStatus;
}

/** GET /api/v1/parking/reservations 목록 페이지 응답. */
export interface ParkingReservationListResponse {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  reservations: ParkingReservationResponse[];
}

/** POST /api/v1/parking/reservations 요청. */
export interface ParkingReservationCreateRequest {
  vehicleId: number;
  zoneId: number;
  spotId?: number | null;
  reservedAt: string; // ISO LocalDateTime
}

/** GET /api/v1/parking/reservations 쿼리 파라미터. */
export interface ParkingReservationFilter {
  vehicleId?: number;
  zoneId?: number;
  status?: ReservationStatus;
  page?: number;
  size?: number;
}
