// 예약(reservation) 도메인 MSW 핸들러. ADMIN 1 + cat 5 공용 4 = 5종.
// GET /reservations 는 PageResponse 래핑, GET /zones/{zoneId}/reservations 는 직반환.
import { http, HttpResponse } from "msw";

import type {
  ReservationListItem,
  ReservationResponse,
  ReservationStatus,
  ReservationUpdateRequest,
} from "@/src/features/reservation/types";

// 백엔드 V8 시드 기반 더미 6건 (CONFIRMED 2 + CHECKED_IN 1 + CANCELLED 1 + NO_SHOW 1 + CONFIRMED 1).
// reservationId 와 list id 동일. zone 은 회의실 A(2) · 회의실 B(4) · 회의실 C(5).
const reservations: ReservationResponse[] = [
  {
    reservationId: 1,
    zoneName: "회의실 A",
    userName: "박성종",
    startTime: "2026-05-15T10:00:00",
    endTime: "2026-05-15T11:00:00",
    purpose: "캡스톤 디자인 주간 회의",
    status: "CONFIRMED",
    checkInTime: null,
  },
  {
    reservationId: 2,
    zoneName: "회의실 B",
    userName: "김민지",
    startTime: "2026-05-15T13:00:00",
    endTime: "2026-05-15T14:30:00",
    purpose: "프론트 디자인 리뷰",
    status: "CHECKED_IN",
    checkInTime: "2026-05-15T12:55:00",
  },
  {
    reservationId: 3,
    zoneName: "회의실 A",
    userName: "이재훈",
    startTime: "2026-05-14T15:00:00",
    endTime: "2026-05-14T16:00:00",
    purpose: "백엔드 sprint 회고",
    status: "NO_SHOW",
    checkInTime: null,
  },
  {
    reservationId: 4,
    zoneName: "회의실 C",
    userName: "박성종",
    startTime: "2026-05-16T09:00:00",
    endTime: "2026-05-16T10:00:00",
    purpose: "교수 면담",
    status: "CONFIRMED",
    checkInTime: null,
  },
  {
    reservationId: 5,
    zoneName: "회의실 B",
    userName: "정유진",
    startTime: "2026-05-13T11:00:00",
    endTime: "2026-05-13T12:00:00",
    purpose: "마케팅 정기 회의",
    status: "CANCELLED",
    checkInTime: null,
  },
  {
    reservationId: 6,
    zoneName: "회의실 A",
    userName: "박성종",
    startTime: "2026-05-15T16:00:00",
    endTime: "2026-05-15T17:00:00",
    purpose: "팀 멘토링",
    status: "CONFIRMED",
    checkInTime: null,
  },
];

function toListItem(r: ReservationResponse): ReservationListItem {
  return {
    id: r.reservationId,
    userName: r.userName,
    zoneName: r.zoneName,
    startTime: r.startTime,
    endTime: r.endTime,
    status: r.status,
  };
}

export const reservationHandlers = [
  // 전체 예약 목록 [ADMIN] — PageResponse 래핑.
  http.get("/api/v1/reservations", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") as ReservationStatus | null;
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);

    let filtered = [...reservations].sort((a, b) => b.startTime.localeCompare(a.startTime));
    if (status) filtered = filtered.filter((r) => r.status === status);

    const start = page * size;
    const content = filtered.slice(start, start + size).map(toListItem);
    const totalElements = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));

    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "전체 예약 목록 조회가 완료되었습니다.",
      data: {
        content,
        page,
        size,
        totalElements,
        totalPages,
        last: page + 1 >= totalPages,
      },
    });
  }),

  // 예약 상세.
  http.get("/api/v1/reservations/:id", ({ params }) => {
    const id = Number(params.id);
    const target = reservations.find((r) => r.reservationId === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", errorCode: "RESERVATION_NOT_FOUND", message: "예약을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "예약 상세 조회가 완료되었습니다.",
      data: target,
    });
  }),

  // 예약 수정.
  http.put("/api/v1/reservations/:id", async ({ params, request }) => {
    const id = Number(params.id);
    const target = reservations.find((r) => r.reservationId === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", errorCode: "RESERVATION_NOT_FOUND", message: "예약을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    const body = (await request.json()) as ReservationUpdateRequest;
    if (body.startTime !== undefined) target.startTime = body.startTime;
    if (body.endTime !== undefined) target.endTime = body.endTime;
    if (body.purpose !== undefined) target.purpose = body.purpose;
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "예약 정보가 성공적으로 수정되었습니다.",
      data: target,
    });
  }),

  // 예약 취소 — 백엔드는 status=CANCELLED 로 전환 후 reservationId 반환.
  http.delete("/api/v1/reservations/:id", ({ params }) => {
    const id = Number(params.id);
    const target = reservations.find((r) => r.reservationId === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", errorCode: "RESERVATION_NOT_FOUND", message: "예약을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    target.status = "CANCELLED";
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "예약이 정상적으로 취소되었습니다.",
      data: id,
    });
  }),

  // 구역별 예약 현황 (date 미입력 시 오늘 — 본 mock 은 단순 zoneName 매칭).
  // zoneId 와 zoneName 매핑은 백엔드 실시드 기준이라 mock 에서는 zoneId 별 zoneName 단순 매핑 사용.
  http.get("/api/v1/zones/:zoneId/reservations", ({ params, request }) => {
    const zoneId = Number(params.zoneId);
    const url = new URL(request.url);
    const date = url.searchParams.get("date");

    // mock 한정: zoneId → zoneName 단순 매핑 (실서버 응답과 의미 동일 유지).
    const zoneNameByMockId: Record<number, string> = {
      2: "회의실 A",
      4: "회의실 B",
      5: "회의실 C",
    };
    const zoneName = zoneNameByMockId[zoneId];
    let filtered = zoneName ? reservations.filter((r) => r.zoneName === zoneName) : [];
    if (date) filtered = filtered.filter((r) => r.startTime.startsWith(date));

    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "구역별 예약 현황 조회가 완료되었습니다.",
      data: {
        totalCount: filtered.length,
        reservationList: filtered.map(toListItem),
      },
    });
  }),
];
