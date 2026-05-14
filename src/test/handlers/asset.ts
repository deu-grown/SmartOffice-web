// 자산(asset) 도메인 MSW 핸들러. GET /api/v1/assets 는 PageResponse 래핑.
import { http, HttpResponse } from "msw";

import type { AssetResponse, AssetStatus } from "@/src/features/asset/types";

let nextId = 5;
const assets: AssetResponse[] = [
  {
    assetId: 1,
    assetNumber: "AST-001",
    assetName: "MacBook Pro 16\"",
    category: "IT 기기",
    assignedUserId: 1,
    assignedUserName: "관리자",
    description: "임원용 노트북",
    assetStatus: "ACTIVE",
    purchasedAt: "2025-01-15",
    createdAt: "2025-01-15T09:00:00",
    updatedAt: "2025-01-15T09:00:00",
  },
  {
    assetId: 2,
    assetName: "NAS Storage 40TB",
    assetNumber: "AST-002",
    category: "서버 장비",
    assignedUserId: null,
    assignedUserName: null,
    description: null,
    assetStatus: "ACTIVE",
    purchasedAt: "2025-02-10",
    createdAt: "2025-02-10T10:00:00",
    updatedAt: "2025-02-10T10:00:00",
  },
  {
    assetId: 3,
    assetName: "암호화 USB 512GB",
    assetNumber: "AST-003",
    category: "저장 매체",
    assignedUserId: 2,
    assignedUserName: "박성종",
    description: "보안 데이터 휴대용",
    assetStatus: "INACTIVE",
    purchasedAt: "2024-12-01",
    createdAt: "2024-12-01T11:00:00",
    updatedAt: "2025-03-01T11:00:00",
  },
  {
    assetId: 4,
    assetName: "DSLR Canon EOS R5",
    assetNumber: "AST-004",
    category: "비품",
    assignedUserId: null,
    assignedUserName: null,
    description: "홍보용 카메라",
    assetStatus: "LOST",
    purchasedAt: "2024-08-15",
    createdAt: "2024-08-15T13:00:00",
    updatedAt: "2025-04-20T13:00:00",
  },
];

export const assetHandlers = [
  http.get("/api/v1/assets", ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status") as AssetStatus | null;
    const assignedUserIdParam = url.searchParams.get("assignedUserId");
    const keyword = url.searchParams.get("keyword");
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);

    let filtered = assets;
    if (category) filtered = filtered.filter((a) => a.category === category);
    if (status) filtered = filtered.filter((a) => a.assetStatus === status);
    if (assignedUserIdParam) {
      const aid = Number(assignedUserIdParam);
      filtered = filtered.filter((a) => a.assignedUserId === aid);
    }
    if (keyword) {
      const k = keyword.toLowerCase();
      filtered = filtered.filter(
        (a) => a.assetName.toLowerCase().includes(k) || a.assetNumber.toLowerCase().includes(k)
      );
    }

    const start = page * size;
    const content = filtered.slice(start, start + size);
    const totalElements = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));

    return HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
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

  http.get("/api/v1/assets/:id", ({ params }) => {
    const id = Number(params.id);
    const target = assets.find((a) => a.assetId === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", message: "자산을 찾을 수 없습니다.", data: null },
        { status: 404 }
      );
    }
    return HttpResponse.json({ code: "success", message: "정상 조회되었습니다.", data: target });
  }),

  http.post("/api/v1/assets", async ({ request }) => {
    const body = (await request.json()) as {
      assetNumber: string;
      assetName: string;
      category: string;
      assignedUserId?: number | null;
      description?: string | null;
      assetStatus?: AssetStatus;
      purchasedAt?: string | null;
    };
    const created: AssetResponse = {
      assetId: nextId++,
      assetNumber: body.assetNumber,
      assetName: body.assetName,
      category: body.category,
      assignedUserId: body.assignedUserId ?? null,
      assignedUserName: null,
      description: body.description ?? null,
      assetStatus: body.assetStatus ?? "ACTIVE",
      purchasedAt: body.purchasedAt ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    assets.push(created);
    return HttpResponse.json(
      { code: "success", message: "자산이 등록되었습니다.", data: created },
      { status: 201 }
    );
  }),

  http.put("/api/v1/assets/:id", async ({ params, request }) => {
    const id = Number(params.id);
    const target = assets.find((a) => a.assetId === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", message: "자산을 찾을 수 없습니다.", data: null },
        { status: 404 }
      );
    }
    const body = (await request.json()) as Partial<AssetResponse>;
    if (body.assetNumber !== undefined) target.assetNumber = body.assetNumber;
    if (body.assetName !== undefined) target.assetName = body.assetName;
    if (body.category !== undefined) target.category = body.category;
    if (body.assignedUserId !== undefined) target.assignedUserId = body.assignedUserId;
    if (body.description !== undefined) target.description = body.description;
    if (body.assetStatus !== undefined) target.assetStatus = body.assetStatus;
    if (body.purchasedAt !== undefined) target.purchasedAt = body.purchasedAt;
    target.updatedAt = new Date().toISOString();
    return HttpResponse.json({
      code: "success",
      message: "자산 정보가 수정되었습니다.",
      data: target,
    });
  }),

  http.delete("/api/v1/assets/:id", ({ params }) => {
    const id = Number(params.id);
    const idx = assets.findIndex((a) => a.assetId === id);
    if (idx === -1) {
      return HttpResponse.json(
        { code: "error", message: "자산을 찾을 수 없습니다.", data: null },
        { status: 404 }
      );
    }
    assets.splice(idx, 1);
    return HttpResponse.json({ code: "success", message: "자산이 삭제되었습니다.", data: null });
  }),
];
