// 차량(vehicle) 도메인 MSW 핸들러. CRUD.
import { http, HttpResponse } from "msw";

import type { VehicleResponse, VehicleType } from "@/src/features/vehicle/types";

let nextId = 4;
const vehicles: VehicleResponse[] = [
  {
    vehicleId: 1,
    plateNumber: "12가 3456",
    ownerName: "이수진",
    ownerUserId: 2,
    ownerUserName: "이수진",
    vehicleType: "STAFF",
    purpose: null,
  },
  {
    vehicleId: 2,
    plateNumber: "34나 5678",
    ownerName: "최동욱",
    ownerUserId: 3,
    ownerUserName: "최동욱",
    vehicleType: "STAFF",
    purpose: null,
  },
  {
    vehicleId: 3,
    plateNumber: "56다 7890",
    ownerName: "김민준",
    ownerUserId: null,
    ownerUserName: null,
    vehicleType: "VISITOR",
    purpose: "방문 미팅",
  },
];

const PAGE_SIZE = 10;

export const vehicleHandlers = [
  http.get("/api/v1/vehicles", ({ request }) => {
    const url = new URL(request.url);
    const vehicleType = url.searchParams.get("vehicleType") as VehicleType | null;
    const keyword = url.searchParams.get("keyword");
    const page = Number(url.searchParams.get("page") ?? 0);

    let filtered = vehicles;
    if (vehicleType) filtered = filtered.filter((v) => v.vehicleType === vehicleType);
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (v) => v.plateNumber.toLowerCase().includes(kw) || v.ownerName.toLowerCase().includes(kw),
      );
    }

    const totalElements = filtered.length;
    const totalPages = Math.max(Math.ceil(totalElements / PAGE_SIZE), 1);
    const sliced = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "정상 조회되었습니다.",
      data: { totalElements, totalPages, currentPage: page, vehicles: sliced },
    });
  }),

  http.get("/api/v1/vehicles/:id", ({ params }) => {
    const id = Number(params.id);
    const v = vehicles.find((x) => x.vehicleId === id);
    if (!v) {
      return HttpResponse.json(
        { code: "error", errorCode: "VEHICLE_NOT_FOUND", message: "차량을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    return HttpResponse.json({ code: "success", errorCode: null, message: "정상 조회되었습니다.", data: v });
  }),

  http.post("/api/v1/vehicles", async ({ request }) => {
    const body = (await request.json()) as {
      plateNumber: string;
      vehicleType: VehicleType;
      ownerName: string;
      ownerUserId?: number | null;
      purpose?: string | null;
    };
    const created: VehicleResponse = {
      vehicleId: nextId++,
      plateNumber: body.plateNumber,
      ownerName: body.ownerName,
      ownerUserId: body.ownerUserId ?? null,
      ownerUserName: body.ownerUserId ? `User ${body.ownerUserId}` : null,
      vehicleType: body.vehicleType,
      purpose: body.purpose ?? null,
    };
    vehicles.push(created);
    return HttpResponse.json(
      { code: "success", errorCode: null, message: "차량이 등록되었습니다.", data: created },
      { status: 201 },
    );
  }),

  http.put("/api/v1/vehicles/:id", async ({ params, request }) => {
    const id = Number(params.id);
    const target = vehicles.find((v) => v.vehicleId === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", errorCode: "VEHICLE_NOT_FOUND", message: "차량을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    const body = (await request.json()) as Partial<VehicleResponse>;
    if (body.plateNumber !== undefined) target.plateNumber = body.plateNumber;
    if (body.vehicleType !== undefined) target.vehicleType = body.vehicleType;
    if (body.ownerName !== undefined) target.ownerName = body.ownerName;
    if (body.purpose !== undefined) target.purpose = body.purpose;
    return HttpResponse.json({ code: "success", errorCode: null, message: "차량 정보가 수정되었습니다.", data: target });
  }),

  http.delete("/api/v1/vehicles/:id", ({ params }) => {
    const id = Number(params.id);
    const idx = vehicles.findIndex((v) => v.vehicleId === id);
    if (idx === -1) {
      return HttpResponse.json(
        { code: "error", errorCode: "VEHICLE_NOT_FOUND", message: "차량을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    vehicles.splice(idx, 1);
    return HttpResponse.json({ code: "success", errorCode: null, message: "차량이 삭제되었습니다.", data: null });
  }),
];
