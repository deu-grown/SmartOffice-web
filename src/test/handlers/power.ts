// 전력 도메인 MSW 핸들러. G2 단계는 current / billing 2 엔드포인트 모방.
// G7 진입 시 hourly / zone-billing / calculate 핸들러가 본 파일에 추가될 예정.
import { http, HttpResponse } from "msw";

export const powerHandlers = [
  http.get("/api/v1/power/zones/:zoneId/current", ({ params }) => {
    const zoneId = Number(params.zoneId);
    return HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      data: {
        zoneId,
        zoneName: `구역 ${zoneId}`,
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
];
