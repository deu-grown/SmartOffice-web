// 전력 도메인 MSW 핸들러.
import { http, HttpResponse } from "msw";

// V7/V8 시드 기반 POWER 미터 보유 zone 고정 fixture.
const POWER_ZONES = [
  { zoneId: 2, zoneName: "회의실 A", meterCount: 2 },
  { zoneId: 4, zoneName: "회의실 B", meterCount: 1 },
  { zoneId: 5, zoneName: "개발팀 좌석", meterCount: 2 },
  { zoneId: 7, zoneName: "서버실", meterCount: 1 },
];
const POWER_ZONE_NAMES: Record<number, string> = Object.fromEntries(
  POWER_ZONES.map((z) => [z.zoneId, z.zoneName])
);

export const powerHandlers = [
  http.get("/api/v1/power/zones", () =>
    HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "정상 조회되었습니다.",
      data: POWER_ZONES,
    })
  ),

  http.get("/api/v1/power/zones/:zoneId/current", ({ params }) => {
    const zoneId = Number(params.zoneId);
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "정상 조회되었습니다.",
      data: {
        zoneId,
        zoneName: POWER_ZONE_NAMES[zoneId] ?? `구역 ${zoneId}`,
        devices: [
          {
            deviceId: 101,
            deviceName: "에어컨 #1",
            avgWatt: 850.5,
            measuredAt: "2026-05-14T10:00:00",
          },
          {
            deviceId: 102,
            deviceName: "조명",
            avgWatt: 120.0,
            measuredAt: "2026-05-14T10:00:00",
          },
        ],
      },
    });
  }),

  http.get("/api/v1/power/billing", ({ request }) => {
    const url = new URL(request.url);
    const year = Number(url.searchParams.get("year") ?? 2026);
    const month = Number(url.searchParams.get("month") ?? 5);
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "정상 조회되었습니다.",
      data: {
        year,
        month,
        totalKwh: 1234.56,
        totalFee: 256000,
        zones: [
          { zoneId: 1, zoneName: "본관 1F 로비", totalKwh: 412.3, totalFee: 84000 },
          { zoneId: 2, zoneName: "개발본부", totalKwh: 822.26, totalFee: 172000 },
        ],
      },
    });
  }),

  // ── G7 확장 ────────────────────────────────────────────────
  http.get("/api/v1/power/zones/:zoneId/hourly", ({ params }) => {
    const zoneId = Number(params.zoneId);
    // 24시간 시간별 로그 fixture
    const logs = Array.from({ length: 12 }, (_, i) => ({
      id: 1000 + i,
      deviceId: 101,
      deviceName: "에어컨 #1",
      hourAt: `2026-05-14T${String(i * 2).padStart(2, "0")}:00:00`,
      kwh: 1.5 + Math.sin(i) * 0.5,
      avgWatt: 750 + i * 10,
      peakWatt: 900 + i * 15,
    }));
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "정상 조회되었습니다.",
      data: {
        zoneId,
        zoneName: POWER_ZONE_NAMES[zoneId] ?? `구역 ${zoneId}`,
        logs,
      },
    });
  }),

  http.get("/api/v1/power/zones/:zoneId/billing", ({ params, request }) => {
    const zoneId = Number(params.zoneId);
    const url = new URL(request.url);
    const year = Number(url.searchParams.get("year") ?? 2026);
    const month = Number(url.searchParams.get("month") ?? 5);
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "정상 조회되었습니다.",
      data: {
        zoneId,
        zoneName: POWER_ZONE_NAMES[zoneId] ?? `구역 ${zoneId}`,
        records: [
          {
            id: 100 + zoneId,
            year,
            month,
            totalKwh: 822.26,
            unitPrice: 200,
            baseFee: 5000,
            usageFee: 164452,
            totalFee: 169452,
            createdAt: "2026-05-01T00:10:00",
          },
        ],
      },
    });
  }),

  http.post("/api/v1/power/billing/calculate", async ({ request }) => {
    const body = (await request.json()) as { year: number; month: number; unitPrice: number; baseFee: number; zoneIds?: number[] };
    const targetZones = body.zoneIds && body.zoneIds.length > 0 ? body.zoneIds : [2, 4, 5, 7];
    const successCount = targetZones.length;
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "전력 요금 산출이 완료되었습니다.",
      data: {
        year: body.year,
        month: body.month,
        totalCount: targetZones.length,
        successCount,
        skipCount: 0,
        totalFee: successCount * (body.baseFee + 100000),
      },
    });
  }),
];
