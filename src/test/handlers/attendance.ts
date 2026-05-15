// 근태 도메인 MSW 핸들러 — ADMIN 3 엔드포인트.
import { http, HttpResponse } from "msw";

interface AttendanceRow {
  attendanceId: number;
  userId: number;
  userName: string;
  workDate: string;
  checkIn: string | null;
  checkOut: string | null;
  workMinutes: number | null;
  overtimeMinutes: number | null;
  attendanceStatus: string;
  attendanceNote: string | null;
}

const rows: AttendanceRow[] = [
  {
    attendanceId: 1,
    userId: 1,
    userName: "관리자",
    workDate: "2026-05-14",
    checkIn: "2026-05-14T08:55:00",
    checkOut: "2026-05-14T18:05:00",
    workMinutes: 540,
    overtimeMinutes: 5,
    attendanceStatus: "PRESENT",
    attendanceNote: null,
  },
  {
    attendanceId: 2,
    userId: 2,
    userName: "김호탈",
    workDate: "2026-05-14",
    checkIn: "2026-05-14T09:15:00",
    checkOut: "2026-05-14T18:00:00",
    workMinutes: 525,
    overtimeMinutes: 0,
    attendanceStatus: "LATE",
    attendanceNote: null,
  },
  {
    attendanceId: 3,
    userId: 3,
    userName: "이순신",
    workDate: "2026-05-14",
    checkIn: null,
    checkOut: null,
    workMinutes: null,
    overtimeMinutes: null,
    attendanceStatus: "ABSENT",
    attendanceNote: null,
  },
];

export const attendanceHandlers = [
  http.get("/api/v1/attendance/daily", ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const name = url.searchParams.get("name");
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);

    let filtered = rows.filter((r) => r.workDate === date);
    if (name) filtered = filtered.filter((r) => r.userName.includes(name));

    const totalElements = filtered.length;
    const totalPages = Math.max(Math.ceil(totalElements / size), 1);
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "정상 조회되었습니다.",
      data: {
        content: filtered.slice(page * size, (page + 1) * size),
        page,
        size,
        totalElements,
        totalPages,
        last: page + 1 >= totalPages,
      },
    });
  }),

  http.put("/api/v1/attendance/:id", async ({ request, params }) => {
    const id = Number(params.id);
    const body = (await request.json()) as {
      checkIn?: string;
      checkOut?: string;
      note?: string;
    };
    const target = rows.find((r) => r.attendanceId === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", errorCode: "ATTENDANCE_NOT_FOUND", message: "근태 기록을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    if (body.checkIn !== undefined) target.checkIn = body.checkIn;
    if (body.checkOut !== undefined) target.checkOut = body.checkOut;
    if (body.note !== undefined) target.attendanceNote = body.note;
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "근태 정보가 수정되었습니다.",
      data: null,
    });
  }),

  http.post("/api/v1/attendance/batch", async ({ request }) => {
    const body = (await request.json()) as { targetDate: string };
    if (!body.targetDate) {
      return HttpResponse.json(
        { code: "error", errorCode: "MISSING_REQUIRED_FIELD", message: "targetDate 는 필수입니다.", data: null },
        { status: 400 },
      );
    }
    // 처리 건수 — rows 길이로 모방.
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "배치가 완료되었습니다.",
      data: rows.length,
    });
  }),
];
