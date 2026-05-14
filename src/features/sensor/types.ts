// 센서(sensor) 도메인 타입 — 백엔드 DTO 와 1:1 매핑. 환경 센서 (TEMP/HUMI/CO2 등) 최신·이력 조회.

/** SensorDataDto — 백엔드 응답 sensorDataList 의 항목. */
export interface SensorData {
  id: number;
  sensorType: string;
  /** BigDecimal → JSON number/string 호환. */
  value: number | string;
  unit: string;
  timestamp: string; // ISO LocalDateTime
}

/** GET /api/v1/sensors/latest?zoneId 응답. */
export interface SensorLatestResponse {
  searchQuery: { zoneId: number };
  totalCount: number;
  sensorDataList: SensorData[];
}

/** GET /api/v1/zones/{id}/sensors/logs?startDate&endDate 응답. */
export interface SensorHistoryResponse {
  searchQuery: { zoneId: number; period: string };
  totalCount: number;
  sensorDataList: SensorData[];
}
