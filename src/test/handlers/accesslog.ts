// 출입 로그 도메인 MSW 핸들러. GET /access-logs (필터 8종) + GET /users/{id}/access-logs.
// C9 에서 features/user 의 access-logs 임시 inline 핸들러를 이관 + 전체 조회 신규.
import { http, HttpResponse } from "msw";

import { __testUsersForAccessLog } from "./user";

interface AccessLogRow {
  id: number;
  userId: number | null;
  userName: string | null;
  employeeNumber: string | null;
  uid: string | null;
  deviceId: number;
  deviceName: string;
  zoneId: number;
  zoneName: string;
  direction: string;
  authResult: string;
  denyReason: string | null;
  taggedAt: string;
}

// 백엔드 시드 데이터를 모방. authResult 는 코드 표준(APPROVED/DENIED)을 사용한다.
// 시드에 ALLOW 값이 잔존하는 백엔드 정합성 이슈는 BACKEND_SUGGESTIONS 로 등록 예정.
const logs: AccessLogRow[] = [
  {
    id: 1,
    userId: 1,
    userName: "관리자",
    employeeNumber: "EMP001",
    uid: "ADMIN-CARD-UID-001",
    deviceId: 1,
    deviceName: "회의실A 출입리더기",
    zoneId: 2,
    zoneName: "회의실A",
    direction: "IN",
    authResult: "APPROVED",
    denyReason: null,
    taggedAt: "2026-05-14T08:55:00",
  },
  {
    id: 2,
    userId: 1,
    userName: "관리자",
    employeeNumber: "EMP001",
    uid: "ADMIN-CARD-UID-001",
    deviceId: 1,
    deviceName: "회의실A 출입리더기",
    zoneId: 2,
    zoneName: "회의실A",
    direction: "OUT",
    authResult: "APPROVED",
    denyReason: null,
    taggedAt: "2026-05-14T11:30:00",
  },
  {
    id: 3,
    userId: 9,
    userName: "분실자",
    employeeNumber: "EMP009",
    uid: "EMP009-CARD-UID-001",
    deviceId: 5,
    deviceName: "서버실 출입리더기",
    zoneId: 7,
    zoneName: "서버실",
    direction: "IN",
    authResult: "DENIED",
    denyReason: "분실 신고된 카드",
    taggedAt: "2026-05-13T14:00:00",
  },
];

export const accessLogHandlers = [
  http.get("/api/v1/access-logs", ({ request }) => {
    const url = new URL(request.url);
    const zoneId = url.searchParams.get("zoneId");
    const userId = url.searchParams.get("userId");
    const authResult = url.searchParams.get("authResult");
    const direction = url.searchParams.get("direction");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);

    let filtered = logs;
    if (zoneId) filtered = filtered.filter((l) => l.zoneId === Number(zoneId));
    if (userId) filtered = filtered.filter((l) => l.userId === Number(userId));
    if (authResult) filtered = filtered.filter((l) => l.authResult === authResult);
    if (direction) filtered = filtered.filter((l) => l.direction === direction);
    if (startDate) filtered = filtered.filter((l) => l.taggedAt >= startDate);
    if (endDate) filtered = filtered.filter((l) => l.taggedAt <= `${endDate}T23:59:59`);

    const totalElements = filtered.length;
    const totalPages = Math.max(Math.ceil(totalElements / size), 1);
    return HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      data: {
        totalElements,
        totalPages,
        currentPage: page,
        logs: filtered.slice(page * size, (page + 1) * size),
      },
    });
  }),

  http.get("/api/v1/users/:id/access-logs", ({ params, request }) => {
    const id = Number(params.id);
    const u = __testUsersForAccessLog.find((x) => x.id === id);
    if (!u) {
      return HttpResponse.json(
        { code: "error", message: "직원을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);
    const direction = url.searchParams.get("direction");

    let userLogs = logs.filter((l) => l.userId === u.id);
    if (direction) userLogs = userLogs.filter((l) => l.direction === direction);

    return HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      data: {
        userId: u.id,
        userName: u.name,
        totalElements: userLogs.length,
        totalPages: Math.max(Math.ceil(userLogs.length / size), 1),
        currentPage: page,
        logs: userLogs.slice(page * size, (page + 1) * size),
      },
    });
  }),
];
