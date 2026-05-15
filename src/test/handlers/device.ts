// 장치(device) 도메인 MSW 핸들러. zone fixture(handlers/zone.ts) 와 zoneId 정합.
import { http, HttpResponse } from "msw";

type DeviceStatus = "ACTIVE" | "INACTIVE";

interface DeviceRow {
  id: number;
  name: string;
  deviceType: string;
  serialNumber: string | null;
  mqttTopic: string | null;
  zoneId: number;
  zoneName: string;
  status: DeviceStatus;
  createdAt: string;
}

let nextId = 5;
const devices: DeviceRow[] = [
  {
    id: 1,
    name: "NFC 리더기 A",
    deviceType: "NFC_READER",
    serialNumber: "NFC-001",
    mqttTopic: "smartoffice/2/access",
    zoneId: 2,
    zoneName: "회의실 A",
    status: "ACTIVE",
    createdAt: "2026-03-02T10:00:00",
  },
  {
    id: 2,
    name: "환경 센서 A",
    deviceType: "ENV_SENSOR",
    serialNumber: "ENV-001",
    mqttTopic: "smartoffice/2/temp",
    zoneId: 2,
    zoneName: "회의실 A",
    status: "ACTIVE",
    createdAt: "2026-03-02T10:05:00",
  },
  {
    id: 3,
    name: "전력 미터 A",
    deviceType: "POWER_METER",
    serialNumber: "PWR-001",
    mqttTopic: "smartoffice/5/power",
    zoneId: 5,
    zoneName: "개발팀 좌석",
    status: "ACTIVE",
    createdAt: "2026-03-02T10:10:00",
  },
  {
    id: 4,
    name: "서버실 출입 게이트",
    deviceType: "DOOR_LOCK",
    serialNumber: "DL-001",
    mqttTopic: "smartoffice/7/command",
    zoneId: 7,
    zoneName: "서버실",
    status: "INACTIVE",
    createdAt: "2026-03-02T10:15:00",
  },
];

export const deviceHandlers = [
  http.get("/api/v1/devices", () =>
    HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "정상 조회되었습니다.",
      data: devices,
    })
  ),

  http.get("/api/v1/devices/:id", ({ params }) => {
    const id = Number(params.id);
    const target = devices.find((d) => d.id === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", errorCode: "DEVICE_NOT_FOUND", message: "장치를 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "정상 조회되었습니다.",
      data: { ...target, updatedAt: null },
    });
  }),

  http.post("/api/v1/devices", async ({ request }) => {
    const body = (await request.json()) as {
      zoneId: number;
      name: string;
      deviceType: string;
      serialNumber?: string | null;
      status?: DeviceStatus;
    };
    const created: DeviceRow = {
      id: nextId++,
      name: body.name,
      deviceType: body.deviceType,
      serialNumber: body.serialNumber ?? null,
      mqttTopic: `smartoffice/${body.zoneId}/${body.deviceType.toLowerCase()}`,
      zoneId: body.zoneId,
      zoneName: `Zone ${body.zoneId}`,
      status: body.status ?? "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    devices.push(created);
    return HttpResponse.json(
      { code: "success", errorCode: null, message: "장치가 등록되었습니다.", data: created },
      { status: 201 },
    );
  }),

  http.put("/api/v1/devices/:id", async ({ request, params }) => {
    const id = Number(params.id);
    const body = (await request.json()) as {
      name?: string;
      deviceType?: string;
      serialNumber?: string | null;
      status?: DeviceStatus;
      zoneId?: number;
    };
    const target = devices.find((d) => d.id === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", errorCode: "DEVICE_NOT_FOUND", message: "장치를 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    if (body.name !== undefined) target.name = body.name;
    if (body.deviceType !== undefined) target.deviceType = body.deviceType;
    if (body.serialNumber !== undefined) target.serialNumber = body.serialNumber;
    if (body.status !== undefined) target.status = body.status;
    if (body.zoneId !== undefined) {
      target.zoneId = body.zoneId;
      target.zoneName = `Zone ${body.zoneId}`;
    }
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "장치 정보가 수정되었습니다.",
      data: { ...target, updatedAt: new Date().toISOString() },
    });
  }),

  http.delete("/api/v1/devices/:id", ({ params }) => {
    const id = Number(params.id);
    const idx = devices.findIndex((d) => d.id === id);
    if (idx === -1) {
      return HttpResponse.json(
        { code: "error", errorCode: "DEVICE_NOT_FOUND", message: "장치를 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    devices.splice(idx, 1);
    return HttpResponse.json({ code: "success", errorCode: null, message: "장치가 삭제되었습니다.", data: null });
  }),
];
