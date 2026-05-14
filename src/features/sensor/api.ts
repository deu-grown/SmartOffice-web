// 센서(sensor) 도메인 REST API 호출 — 2 ADMIN 엔드포인트 (cat 2).
// IoT 수신(POST /sensors/logs) 은 permitAll 로 web 호출 범위 외.
import { apiGet } from "@/src/lib/api/client";

import type { SensorHistoryResponse, SensorLatestResponse } from "./types";

export const sensorApi = {
  /** 구역별 최신 센서 데이터 (TEMP/HUMI/CO2 등). */
  latest: (zoneId: number) =>
    apiGet<SensorLatestResponse>("/sensors/latest", { params: { zoneId } }),
  /** 구역별 센서 로그 이력 (날짜 범위). */
  history: (zoneId: number, startDate: string, endDate: string) =>
    apiGet<SensorHistoryResponse>(`/zones/${zoneId}/sensors/logs`, { params: { startDate, endDate } }),
};
