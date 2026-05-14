// 대시보드 도메인 MSW 핸들러. 백엔드 DashboardController 의 응답 형태를 그대로 모방한다.
import { http, HttpResponse } from "msw";

export const dashboardHandlers = [
  http.get("/api/v1/dashboard/summary", () =>
    HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      data: {
        totalUsers: 42,
        todayReservations: 7,
        activeDevices: 18,
        pendingApprovals: 2,
      },
    }),
  ),

  http.get("/api/v1/dashboard/sensors/current", () =>
    HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      // 백엔드 curl 검증 결과 일부 구역은 temp/humi/co2 가 null 로 내려오므로 한 건을 부분 null 로 모방.
      data: [
        {
          zoneId: 1,
          zoneName: "본관 1F 로비",
          temp: 24.5,
          humi: 45,
          co2: 650,
          updatedAt: "2026-05-14T10:00:00",
        },
        {
          zoneId: 2,
          zoneName: "서버실",
          temp: 18.3,
          humi: null,
          co2: null,
          updatedAt: "2026-05-14T09:30:00",
        },
      ],
    }),
  ),

  http.get("/api/v1/dashboard/attendance/today", () =>
    HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      data: {
        presentCount: 38,
        absentCount: 2,
        lateCount: 2,
        totalExpected: 42,
      },
    }),
  ),

  http.get("/api/v1/dashboard/access/recent", ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const items = [
      {
        id: 1,
        userName: "김철수",
        zoneName: "본관 1F 로비",
        accessTime: "2026-05-14T14:25:01",
        type: "IN",
      },
      {
        id: 2,
        userName: "이영희",
        zoneName: "연구동 3F",
        accessTime: "2026-05-14T14:22:15",
        type: "IN",
      },
      {
        id: 3,
        userName: "박민수",
        zoneName: "본관 4F 회의실",
        accessTime: "2026-05-14T14:18:42",
        type: "OUT",
      },
    ].slice(0, limit);
    return HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      data: items,
    });
  }),
];
