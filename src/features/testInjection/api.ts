// 하드웨어 대체 주입 API — 각 함수는 엔드포인트 하나와 1:1 대응한다.
// 인증 토큰은 client.ts 인터셉터가 자동 첨부 — 별도 처리 불필요.
import { apiPost } from "@/src/lib/api/client";

import type {
  BatchTriggerRequest,
  PowerBillingCalculateRequest,
  PowerBillingCalculateResponse,
  ParkingStatusUpdateRequest,
  ParkingStatusUpdateResponse,
  ReservationCheckInRequest,
  ReservationCheckInResponse,
  SensorLogRequest,
  SensorLogResponse,
  TagEventRequest,
  TagEventResponse,
} from "./types";

/** POST /api/v1/access-logs/tag — NFC 출입 태그 (permitAll). */
export const postTagEvent = (body: TagEventRequest) =>
  apiPost<TagEventResponse, TagEventRequest>("/access-logs/tag", body);

/** POST /api/v1/sensors/logs — 센서 로그 주입 (permitAll). */
export const postSensorLog = (body: SensorLogRequest) =>
  apiPost<SensorLogResponse, SensorLogRequest>("/sensors/logs", body);

/** POST /api/v1/parking/spots/{spotId}/status — 주차 점유 상태 (permitAll). */
export const postParkingStatus = (spotId: number, body: ParkingStatusUpdateRequest) =>
  apiPost<ParkingStatusUpdateResponse, ParkingStatusUpdateRequest>(
    `/parking/spots/${spotId}/status`,
    body,
  );

/** POST /api/v1/attendance/batch — 근태 일별 집계 배치 (ADMIN). */
export const postAttendanceBatch = (body: BatchTriggerRequest) =>
  apiPost<number, BatchTriggerRequest>("/attendance/batch", body);

/** POST /api/v1/power/billing/calculate — 전력 요금 산출 (ADMIN). */
export const postPowerBillingCalculate = (body: PowerBillingCalculateRequest) =>
  apiPost<PowerBillingCalculateResponse, PowerBillingCalculateRequest>(
    "/power/billing/calculate",
    body,
  );

/** POST /api/v1/reservations/{id}/check-in — 회의실 NFC 체크인 (ADMIN/본인). */
export const postReservationCheckIn = (id: number, body: ReservationCheckInRequest) =>
  apiPost<ReservationCheckInResponse, ReservationCheckInRequest>(
    `/reservations/${id}/check-in`,
    body,
  );
