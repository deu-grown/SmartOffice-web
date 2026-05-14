// 주차(parking) 도메인 MSW 핸들러. cat 2 ADMIN 4 + cat 5 공용 2 통합.
// GET /spots 는 List 직반환 (PageResponse 아님).
import { http, HttpResponse } from "msw";

import type {
  ParkingSpotResponse,
  SpotStatus,
  SpotType,
} from "@/src/features/parking/types";

let nextId = 5;
const spots: ParkingSpotResponse[] = [
  {
    spotId: 1,
    zoneId: 8,
    zoneName: "지하 1층 주차장",
    spotNumber: "B1-001",
    spotType: "REGULAR",
    deviceId: 11,
    deviceName: "주차 센서 B1-001",
    positionX: 100,
    positionY: 200,
    occupied: true,
    spotStatus: "ACTIVE",
    createdAt: "2026-03-02T10:00:00",
    updatedAt: "2026-05-10T10:00:00",
  },
  {
    spotId: 2,
    zoneId: 8,
    zoneName: "지하 1층 주차장",
    spotNumber: "B1-002",
    spotType: "EV",
    deviceId: 12,
    deviceName: "주차 센서 B1-002",
    positionX: 150,
    positionY: 200,
    occupied: false,
    spotStatus: "ACTIVE",
    createdAt: "2026-03-02T10:05:00",
    updatedAt: "2026-05-10T10:05:00",
  },
  {
    spotId: 3,
    zoneId: 8,
    zoneName: "지하 1층 주차장",
    spotNumber: "B1-003",
    spotType: "DISABLED",
    deviceId: null,
    deviceName: null,
    positionX: 200,
    positionY: 200,
    occupied: false,
    spotStatus: "ACTIVE",
    createdAt: "2026-03-02T10:10:00",
    updatedAt: "2026-05-10T10:10:00",
  },
  {
    spotId: 4,
    zoneId: 8,
    zoneName: "지하 1층 주차장",
    spotNumber: "B1-004",
    spotType: "REGULAR",
    deviceId: 13,
    deviceName: "주차 센서 B1-004",
    positionX: 250,
    positionY: 200,
    occupied: true,
    spotStatus: "INACTIVE",
    createdAt: "2026-03-02T10:15:00",
    updatedAt: "2026-05-10T10:15:00",
  },
];

export const parkingHandlers = [
  http.get("/api/v1/parking/spots", ({ request }) => {
    const url = new URL(request.url);
    const zoneIdParam = url.searchParams.get("zoneId");
    const spotType = url.searchParams.get("spotType") as SpotType | null;
    const status = url.searchParams.get("status") as SpotStatus | null;

    let filtered = spots;
    if (zoneIdParam) {
      const zid = Number(zoneIdParam);
      filtered = filtered.filter((s) => s.zoneId === zid);
    }
    if (spotType) filtered = filtered.filter((s) => s.spotType === spotType);
    if (status) filtered = filtered.filter((s) => s.spotStatus === status);

    return HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      data: filtered,
    });
  }),

  http.post("/api/v1/parking/spots", async ({ request }) => {
    const body = (await request.json()) as {
      zoneId: number;
      spotNumber: string;
      spotType: SpotType;
      deviceId?: number | null;
      positionX?: number | null;
      positionY?: number | null;
      spotStatus?: SpotStatus;
    };
    const created: ParkingSpotResponse = {
      spotId: nextId++,
      zoneId: body.zoneId,
      zoneName: `Zone ${body.zoneId}`,
      spotNumber: body.spotNumber,
      spotType: body.spotType,
      deviceId: body.deviceId ?? null,
      deviceName: body.deviceId ? `Device ${body.deviceId}` : null,
      positionX: body.positionX ?? null,
      positionY: body.positionY ?? null,
      occupied: false,
      spotStatus: body.spotStatus ?? "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    spots.push(created);
    return HttpResponse.json(
      { code: "success", message: "주차면이 등록되었습니다.", data: created },
      { status: 201 },
    );
  }),

  http.put("/api/v1/parking/spots/:spotId", async ({ params, request }) => {
    const id = Number(params.spotId);
    const target = spots.find((s) => s.spotId === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", message: "주차면을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    const body = (await request.json()) as Partial<ParkingSpotResponse>;
    if (body.spotNumber !== undefined) target.spotNumber = body.spotNumber;
    if (body.spotType !== undefined) target.spotType = body.spotType;
    if (body.deviceId !== undefined) {
      target.deviceId = body.deviceId;
      target.deviceName = body.deviceId ? `Device ${body.deviceId}` : null;
    }
    if (body.positionX !== undefined) target.positionX = body.positionX;
    if (body.positionY !== undefined) target.positionY = body.positionY;
    if (body.spotStatus !== undefined) target.spotStatus = body.spotStatus;
    target.updatedAt = new Date().toISOString();
    return HttpResponse.json({
      code: "success",
      message: "주차면 정보가 수정되었습니다.",
      data: target,
    });
  }),

  http.delete("/api/v1/parking/spots/:spotId", ({ params }) => {
    const id = Number(params.spotId);
    const idx = spots.findIndex((s) => s.spotId === id);
    if (idx === -1) {
      return HttpResponse.json(
        { code: "error", message: "주차면을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    spots.splice(idx, 1);
    return HttpResponse.json({ code: "success", message: "주차면이 삭제되었습니다.", data: null });
  }),

  http.get("/api/v1/parking/zones/:zoneId/spots", ({ params }) => {
    const zid = Number(params.zoneId);
    const zoneSpots = spots.filter((s) => s.zoneId === zid);
    const total = zoneSpots.length;
    const occupied = zoneSpots.filter((s) => s.occupied).length;
    return HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      data: {
        zoneId: zid,
        zoneName: zoneSpots[0]?.zoneName ?? `Zone ${zid}`,
        totalSpots: total,
        occupiedSpots: occupied,
        availableSpots: total - occupied,
        spots: zoneSpots,
      },
    });
  }),

  http.get("/api/v1/parking/zones/:zoneId/map", ({ params }) => {
    const zid = Number(params.zoneId);
    const zoneSpots = spots.filter((s) => s.zoneId === zid);
    return HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      data: {
        zoneId: zid,
        zoneName: zoneSpots[0]?.zoneName ?? `Zone ${zid}`,
        spots: zoneSpots.map((s) => ({
          spotId: s.spotId,
          spotNumber: s.spotNumber,
          spotType: s.spotType,
          positionX: s.positionX,
          positionY: s.positionY,
          occupied: s.occupied,
        })),
      },
    });
  }),
];
