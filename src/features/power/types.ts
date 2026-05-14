// 백엔드 com.grown.smartoffice.domain.power.dto 패키지와 1:1 매핑.
// G2(통합 관제) 단계에서는 current / billing 2종만 사용하며, G7 에서 hourly / zone-billing / calculate 가 추가될 예정.

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
