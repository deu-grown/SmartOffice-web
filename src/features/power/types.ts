// 백엔드 com.grown.smartoffice.domain.power.dto 패키지와 1:1 매핑.

/** GET /api/v1/power/zones 응답 항목 — POWER 미터가 설치된 구역 목록. */
export interface PowerZoneItem {
  zoneId: number;
  zoneName: string;
  meterCount: number;
}

/** GET /api/v1/power/zones/{zoneId}/current 응답의 단건 장치 전력. */
export interface DevicePower {
  deviceId: number;
  deviceName: string;
  avgWatt: number;
  measuredAt: string;
}

/** GET /api/v1/power/zones/{zoneId}/current 응답. */
export interface PowerCurrent {
  zoneId: number;
  zoneName: string;
  devices: DevicePower[];
}

/** GET /api/v1/power/billing 응답의 구역 요약. */
export interface PowerBillingZoneSummary {
  zoneId: number;
  zoneName: string;
  totalKwh: number;
  totalFee: number;
}

/** GET /api/v1/power/billing 응답 (전체 구역 월 요금 현황). */
export interface PowerBillingAll {
  year: number;
  month: number;
  totalKwh: number;
  totalFee: number;
  zones: PowerBillingZoneSummary[];
}

/** GET /api/v1/power/billing 쿼리 파라미터. 미지정 시 백엔드가 당월로 처리. */
export interface PowerBillingQuery {
  year?: number;
  month?: number;
}

// ── G7 확장 (묶음 4 커밋 4.3) ──────────────────────────────────────────

/** GET /api/v1/power/zones/{zoneId}/hourly 응답 항목. BigDecimal → number|string 호환. */
export interface PowerHourlyLog {
  id: number;
  deviceId: number;
  deviceName: string;
  hourAt: string;
  kwh: number | string;
  avgWatt: number | string;
  peakWatt: number | string;
}

/** GET /api/v1/power/zones/{zoneId}/hourly 응답. */
export interface PowerHourly {
  zoneId: number;
  zoneName: string;
  logs: PowerHourlyLog[];
}

/** GET /api/v1/power/zones/{zoneId}/hourly 쿼리. */
export interface PowerHourlyQuery {
  startDate?: string;
  endDate?: string;
  deviceId?: number;
}

/** GET /api/v1/power/zones/{zoneId}/billing 응답의 단건. */
export interface PowerBillingRecord {
  id: number;
  year: number;
  month: number;
  totalKwh: number | string;
  unitPrice: number;
  baseFee: number;
  usageFee: number;
  totalFee: number;
  createdAt: string;
}

/** GET /api/v1/power/zones/{zoneId}/billing 응답. */
export interface PowerBillingZone {
  zoneId: number;
  zoneName: string;
  records: PowerBillingRecord[];
}

/** GET /api/v1/power/zones/{zoneId}/billing 쿼리. */
export interface PowerBillingZoneQuery {
  year?: number;
  month?: number;
}

/** POST /api/v1/power/billing/calculate 요청 (위험 액션). */
export interface PowerBillingCalculateRequest {
  year: number;
  month: number;
  unitPrice: number;
  baseFee: number;
  zoneIds?: number[];
}

/** POST /api/v1/power/billing/calculate 응답. */
export interface PowerBillingCalculateResponse {
  year: number;
  month: number;
  totalCount: number;
  successCount: number;
  skipCount: number;
  totalFee: number;
}
