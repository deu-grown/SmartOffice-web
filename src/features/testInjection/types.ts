// 하드웨어 대체 데이터 주입 페이지 전용 타입 — 백엔드 DTO 1:1 영문 매핑.
// 개발 전용(dev-only) 예외 페이지에서만 사용한다. 운영 도메인 types.ts 에 섞지 말 것.

// ─── B-1. NFC 출입 태그 ─────────────────────────────────────────────────────
export interface TagEventRequest {
  deviceId: number;
  uid: string;
  direction: "IN" | "OUT";
  taggedAt?: string; // "yyyy-MM-ddTHH:mm:ss" — 생략 시 서버 시각 사용
}

export interface TagEventResponse {
  authResult: "APPROVED" | "DENIED";
  denyReason: string | null;
  userId: number;
  taggedAt: string;
}

// ─── B-2. 센서 로그 ──────────────────────────────────────────────────────────
export type SensorType = "TEMPERATURE" | "HUMIDITY" | "CO2" | "POWER";

export interface SensorLogRequest {
  zoneId: number;
  deviceId: number;
  sensorType: SensorType;
  value: number;
  unit: string;
  timestamp: string; // "yyyy-MM-ddTHH:mm:ss"
}

export interface SensorLogResponse {
  logId: number;
}

// ─── B-3. 주차 점유 상태 ─────────────────────────────────────────────────────
export interface ParkingStatusUpdateRequest {
  deviceId: number;
  occupied: boolean;
  distanceCm?: number;
}

export interface ParkingStatusUpdateResponse {
  spotId: number;
  occupied: boolean;
  updatedAt: string;
}

// ─── B-4. 근태 배치 트리거 ───────────────────────────────────────────────────
export interface BatchTriggerRequest {
  targetDate: string; // "yyyy-MM-dd"
}

// 응답은 number (집계 건수) — 래퍼 없음

// ─── B-5. 전력 요금 산출 ─────────────────────────────────────────────────────
export interface PowerBillingCalculateRequest {
  year: number;
  month: number;
  unitPrice: number;
  baseFee: number;
  zoneIds?: number[];
}

// 응답은 백엔드 PowerBillingCalculateResponse — 필드 불특정이므로 Record 사용
export type PowerBillingCalculateResponse = Record<string, unknown>;

// ─── B-6. 회의실 NFC 체크인 ──────────────────────────────────────────────────
export interface ReservationCheckInRequest {
  nfcTagId: string; // @NotBlank 만 만족하면 통과 — 백엔드가 값을 검증하지 않음
  latitude?: number;
  longitude?: number;
}

export interface ReservationCheckInResponse {
  checkInTime: string;
  status: string;
}

// ─── 주입 이력 로그 ──────────────────────────────────────────────────────────
export interface InjectionLogEntry {
  id: string;
  at: string;
  domain: string;
  summary: string;
  success: boolean;
}
