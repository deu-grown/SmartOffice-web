// 구역(zone) 도메인 MSW 핸들러. 메모리 fixture 로 CRUD 회귀 검증.
// zoneType: FLOOR | AREA | ROOM (계층 표시).
import { http, HttpResponse } from "msw";

type ZoneType = "FLOOR" | "AREA" | "ROOM";

interface ZoneRow {
  id: number;
  name: string;
  zoneType: ZoneType;
  parentId: number | null;
  description: string | null;
  createdAt: string;
  children?: number[];
}

let nextId = 8;
const zones: ZoneRow[] = [
  { id: 1, name: "본관", zoneType: "FLOOR", parentId: null, description: "본관 1층", createdAt: "2026-03-02T09:00:00" },
  { id: 2, name: "회의실 A", zoneType: "ROOM", parentId: 1, description: "1층 동측", createdAt: "2026-03-02T09:05:00" },
  { id: 3, name: "사무공간", zoneType: "AREA", parentId: 1, description: "오픈 좌석", createdAt: "2026-03-02T09:10:00" },
  { id: 4, name: "회의실 B", zoneType: "ROOM", parentId: 1, description: "1층 서측", createdAt: "2026-03-02T09:15:00" },
  { id: 5, name: "개발팀 좌석", zoneType: "AREA", parentId: 1, description: "개발팀 전용 좌석", createdAt: "2026-03-02T09:20:00" },
  { id: 6, name: "2층", zoneType: "FLOOR", parentId: null, description: "본관 2층", createdAt: "2026-03-02T09:25:00" },
  { id: 7, name: "서버실", zoneType: "ROOM", parentId: 6, description: "2층 보안 구역", createdAt: "2026-03-02T09:30:00" },
];

function buildTree(parentId: number | null): unknown[] {
  return zones
    .filter((z) => z.parentId === parentId)
    .map((z) => ({
      id: z.id,
      name: z.name,
      zoneType: z.zoneType,
      description: z.description,
      children: buildTree(z.id),
    }));
}

export const zoneHandlers = [
  http.get("/api/v1/zones", ({ request }) => {
    const url = new URL(request.url);
    const parentId = url.searchParams.get("parentId");
    const zoneType = url.searchParams.get("zoneType");
    let filtered = zones.slice();
    if (parentId !== null) filtered = filtered.filter((z) => z.parentId === Number(parentId));
    if (zoneType !== null) filtered = filtered.filter((z) => z.zoneType === zoneType);
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "정상 조회되었습니다.",
      data: filtered.map(({ children: _c, ...rest }) => rest),
    });
  }),

  http.get("/api/v1/zones/tree", () =>
    HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "정상 조회되었습니다.",
      data: buildTree(null),
    })
  ),

  http.get("/api/v1/zones/:id", ({ params }) => {
    const id = Number(params.id);
    const z = zones.find((zone) => zone.id === id);
    if (!z) {
      return HttpResponse.json(
        { code: "error", errorCode: "ZONE_NOT_FOUND", message: "구역을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "정상 조회되었습니다.",
      data: {
        id: z.id,
        name: z.name,
        zoneType: z.zoneType,
        parentId: z.parentId,
        description: z.description,
        createdAt: z.createdAt,
      },
    });
  }),

  http.post("/api/v1/zones", async ({ request }) => {
    const body = (await request.json()) as { name: string; zoneType: ZoneType; parentId?: number | null; description?: string | null };
    const created: ZoneRow = {
      id: nextId++,
      name: body.name,
      zoneType: body.zoneType,
      parentId: body.parentId ?? null,
      description: body.description ?? null,
      createdAt: new Date().toISOString(),
    };
    zones.push(created);
    return HttpResponse.json(
      {
        code: "success",
        errorCode: null,
        message: "구역이 등록되었습니다.",
        data: {
          id: created.id,
          name: created.name,
          zoneType: created.zoneType,
          parentId: created.parentId,
          description: created.description,
          createdAt: created.createdAt,
        },
      },
      { status: 201 }
    );
  }),

  http.put("/api/v1/zones/:id", async ({ request, params }) => {
    const id = Number(params.id);
    const body = (await request.json()) as {
      name?: string;
      zoneType?: ZoneType;
      parentId?: number | null;
      clearParent?: boolean;
      description?: string | null;
    };
    const target = zones.find((z) => z.id === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", errorCode: "ZONE_NOT_FOUND", message: "구역을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    if (body.name !== undefined) target.name = body.name;
    if (body.zoneType !== undefined) target.zoneType = body.zoneType;
    if (body.clearParent) {
      target.parentId = null;
    } else if (body.parentId !== undefined && body.parentId !== null) {
      target.parentId = body.parentId;
    }
    if (body.description !== undefined) target.description = body.description;
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "구역 정보가 수정되었습니다.",
      data: {
        id: target.id,
        name: target.name,
        zoneType: target.zoneType,
        parentId: target.parentId,
        description: target.description,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  http.delete("/api/v1/zones/:id", ({ params }) => {
    const id = Number(params.id);
    const idx = zones.findIndex((z) => z.id === id);
    if (idx === -1) {
      return HttpResponse.json(
        { code: "error", errorCode: "ZONE_NOT_FOUND", message: "구역을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    const hasChildren = zones.some((z) => z.parentId === id);
    if (hasChildren) {
      return HttpResponse.json(
        { code: "error", errorCode: "ZONE_HAS_CHILDREN", message: "하위 구역이 있는 구역은 삭제할 수 없습니다.", data: null },
        { status: 409 }
      );
    }
    zones.splice(idx, 1);
    return HttpResponse.json({ code: "success", errorCode: null, message: "구역이 삭제되었습니다.", data: null });
  }),
];
