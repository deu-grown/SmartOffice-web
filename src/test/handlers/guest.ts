// 방문객(guest) 도메인 MSW 핸들러. CRUD + check-in/check-out.
import { http, HttpResponse } from "msw";

import type { GuestResponse, GuestStatus } from "@/src/features/guest/types";

let nextId = 4;
const guests: GuestResponse[] = [
  {
    guestId: 1,
    guestName: "김민준",
    company: "ABC 컨설팅",
    hostUserId: 2,
    hostUserName: "이수진",
    purpose: "사업 제안 미팅",
    contactPhone: "010-1234-5678",
    guestStatus: "SCHEDULED",
    scheduledEntryAt: "2026-05-15T10:00:00",
    actualEntryAt: null,
    actualExitAt: null,
    createdAt: "2026-05-14T09:00:00",
    updatedAt: "2026-05-14T09:00:00",
  },
  {
    guestId: 2,
    guestName: "박지영",
    company: "XYZ 솔루션",
    hostUserId: 3,
    hostUserName: "최동욱",
    purpose: "기술 검토 회의",
    contactPhone: "010-9876-5432",
    guestStatus: "VISITING",
    scheduledEntryAt: "2026-05-15T14:00:00",
    actualEntryAt: "2026-05-15T14:05:00",
    actualExitAt: null,
    createdAt: "2026-05-14T11:00:00",
    updatedAt: "2026-05-15T14:05:00",
  },
  {
    guestId: 3,
    guestName: "정호석",
    company: "DDD 물산",
    hostUserId: 2,
    hostUserName: "이수진",
    purpose: "계약 서명",
    contactPhone: null,
    guestStatus: "COMPLETED",
    scheduledEntryAt: "2026-05-14T09:00:00",
    actualEntryAt: "2026-05-14T09:10:00",
    actualExitAt: "2026-05-14T11:30:00",
    createdAt: "2026-05-13T08:00:00",
    updatedAt: "2026-05-14T11:30:00",
  },
];

const PAGE_SIZE = 10;

export const guestHandlers = [
  http.get("/api/v1/guests", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") as GuestStatus | null;
    const keyword = url.searchParams.get("keyword");
    const page = Number(url.searchParams.get("page") ?? 0);

    let filtered = guests;
    if (status) filtered = filtered.filter((g) => g.guestStatus === status);
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (g) => g.guestName.toLowerCase().includes(kw) || g.company.toLowerCase().includes(kw),
      );
    }

    const totalElements = filtered.length;
    const totalPages = Math.max(Math.ceil(totalElements / PAGE_SIZE), 1);
    const sliced = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "정상 조회되었습니다.",
      data: { totalElements, totalPages, currentPage: page, guests: sliced },
    });
  }),

  http.get("/api/v1/guests/:id", ({ params }) => {
    const id = Number(params.id);
    const g = guests.find((x) => x.guestId === id);
    if (!g) {
      return HttpResponse.json(
        { code: "error", errorCode: "GUEST_NOT_FOUND", message: "방문객을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    return HttpResponse.json({ code: "success", errorCode: null, message: "정상 조회되었습니다.", data: g });
  }),

  http.post("/api/v1/guests", async ({ request }) => {
    const body = (await request.json()) as {
      guestName: string;
      company: string;
      hostUserId: number;
      purpose: string;
      contactPhone?: string | null;
      scheduledEntryAt: string;
    };
    const created: GuestResponse = {
      guestId: nextId++,
      guestName: body.guestName,
      company: body.company,
      hostUserId: body.hostUserId,
      hostUserName: `User ${body.hostUserId}`,
      purpose: body.purpose,
      contactPhone: body.contactPhone ?? null,
      guestStatus: "SCHEDULED",
      scheduledEntryAt: body.scheduledEntryAt,
      actualEntryAt: null,
      actualExitAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    guests.push(created);
    return HttpResponse.json(
      { code: "success", errorCode: null, message: "방문객이 등록되었습니다.", data: created },
      { status: 201 },
    );
  }),

  http.put("/api/v1/guests/:id", async ({ params, request }) => {
    const id = Number(params.id);
    const target = guests.find((g) => g.guestId === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", errorCode: "GUEST_NOT_FOUND", message: "방문객을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    const body = (await request.json()) as Partial<GuestResponse>;
    if (body.guestName !== undefined) target.guestName = body.guestName;
    if (body.company !== undefined) target.company = body.company;
    if (body.purpose !== undefined) target.purpose = body.purpose;
    if (body.contactPhone !== undefined) target.contactPhone = body.contactPhone;
    if (body.scheduledEntryAt !== undefined) target.scheduledEntryAt = body.scheduledEntryAt;
    target.updatedAt = new Date().toISOString();
    return HttpResponse.json({ code: "success", errorCode: null, message: "방문객 정보가 수정되었습니다.", data: target });
  }),

  http.delete("/api/v1/guests/:id", ({ params }) => {
    const id = Number(params.id);
    const idx = guests.findIndex((g) => g.guestId === id);
    if (idx === -1) {
      return HttpResponse.json(
        { code: "error", errorCode: "GUEST_NOT_FOUND", message: "방문객을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    guests.splice(idx, 1);
    return HttpResponse.json({ code: "success", errorCode: null, message: "방문객이 삭제되었습니다.", data: null });
  }),

  http.post("/api/v1/guests/:id/check-in", ({ params }) => {
    const id = Number(params.id);
    const target = guests.find((g) => g.guestId === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", errorCode: "GUEST_NOT_FOUND", message: "방문객을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    if (target.guestStatus !== "SCHEDULED") {
      return HttpResponse.json(
        { code: "error", errorCode: "INVALID_STATUS", message: "예약 상태인 방문객만 체크인할 수 있습니다.", data: null },
        { status: 400 },
      );
    }
    target.guestStatus = "VISITING";
    target.actualEntryAt = new Date().toISOString();
    target.updatedAt = new Date().toISOString();
    return HttpResponse.json({ code: "success", errorCode: null, message: "체크인이 완료되었습니다.", data: target });
  }),

  http.post("/api/v1/guests/:id/check-out", ({ params }) => {
    const id = Number(params.id);
    const target = guests.find((g) => g.guestId === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", errorCode: "GUEST_NOT_FOUND", message: "방문객을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    if (target.guestStatus !== "VISITING") {
      return HttpResponse.json(
        { code: "error", errorCode: "INVALID_STATUS", message: "방문 중인 방문객만 체크아웃할 수 있습니다.", data: null },
        { status: 400 },
      );
    }
    target.guestStatus = "COMPLETED";
    target.actualExitAt = new Date().toISOString();
    target.updatedAt = new Date().toISOString();
    return HttpResponse.json({ code: "success", errorCode: null, message: "체크아웃이 완료되었습니다.", data: target });
  }),
];
