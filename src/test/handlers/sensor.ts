// 센서(sensor) 도메인 MSW 핸들러. 환경 센서(TEMP/HUMI/CO2) 최신·이력.
import { http, HttpResponse } from "msw";

interface SensorRow {
  id: number;
  zoneId: number;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: string;
}

const sensorLogs: SensorRow[] = [
  { id: 1, zoneId: 2, sensorType: "TEMPERATURE", value: 23.5, unit: "C", timestamp: "2026-05-14T09:00:00" },
  { id: 2, zoneId: 2, sensorType: "HUMIDITY", value: 45, unit: "%", timestamp: "2026-05-14T09:00:00" },
  { id: 3, zoneId: 5, sensorType: "TEMPERATURE", value: 24.0, unit: "C", timestamp: "2026-05-14T09:00:00" },
  { id: 4, zoneId: 5, sensorType: "HUMIDITY", value: 48, unit: "%", timestamp: "2026-05-14T09:00:00" },
  { id: 5, zoneId: 5, sensorType: "CO2", value: 620, unit: "ppm", timestamp: "2026-05-14T09:00:00" },
  { id: 6, zoneId: 7, sensorType: "TEMPERATURE", value: 22.0, unit: "C", timestamp: "2026-05-14T09:00:00" },
];

export const sensorHandlers = [
  http.get("/api/v1/sensors/latest", ({ request }) => {
    const url = new URL(request.url);
    const zoneId = Number(url.searchParams.get("zoneId"));
    const filtered = sensorLogs.filter((s) => s.zoneId === zoneId);
    return HttpResponse.json({
      code: "success",
      message: "최신 센서 데이터 조회가 완료되었습니다.",
      data: {
        searchQuery: { zoneId },
        totalCount: filtered.length,
        sensorDataList: filtered.map(({ zoneId: _, ...rest }) => rest),
      },
    });
  }),

  http.get("/api/v1/zones/:id/sensors/logs", ({ params, request }) => {
    const zoneId = Number(params.id);
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate") ?? "";
    const endDate = url.searchParams.get("endDate") ?? "";
    const filtered = sensorLogs.filter((s) => s.zoneId === zoneId);
    return HttpResponse.json({
      code: "success",
      message: "센서 로그 이력 조회가 완료되었습니다.",
      data: {
        searchQuery: { zoneId, period: `${startDate} ~ ${endDate}` },
        totalCount: filtered.length,
        sensorDataList: filtered.map(({ zoneId: _, ...rest }) => rest),
      },
    });
  }),
];
