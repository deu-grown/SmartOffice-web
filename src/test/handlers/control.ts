// 제어(control) 도메인 MSW 핸들러.
import { http, HttpResponse } from "msw";

type ControlStatus = "PENDING" | "COMPLETED" | "FAILED";

interface ControlRow {
  id: number;
  zoneId: number;
  deviceId: number;
  command: string;
  value: string | null;
  status: ControlStatus;
  requestTime: string;
  resultMessage: string | null;
}

let nextId = 4;
const commands: ControlRow[] = [
  { id: 1, zoneId: 5, deviceId: 3, command: "SET_TEMPERATURE", value: "24", status: "COMPLETED", requestTime: "2026-05-14T08:30:00", resultMessage: "OK" },
  { id: 2, zoneId: 7, deviceId: 4, command: "DOOR_LOCK", value: "TRUE", status: "COMPLETED", requestTime: "2026-05-14T09:00:00", resultMessage: "OK" },
  { id: 3, zoneId: 2, deviceId: 1, command: "LIGHT_ON", value: "80", status: "PENDING", requestTime: "2026-05-14T09:30:00", resultMessage: null },
];

export const controlHandlers = [
  http.post("/api/v1/controls", async ({ request }) => {
    const body = (await request.json()) as {
      zoneId: number;
      deviceId: number;
      command: string;
      value?: string;
    };
    const created: ControlRow = {
      id: nextId++,
      zoneId: body.zoneId,
      deviceId: body.deviceId,
      command: body.command,
      value: body.value ?? null,
      status: "PENDING",
      requestTime: new Date().toISOString(),
      resultMessage: null,
    };
    commands.push(created);
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "제어 명령이 발송되었습니다.",
      data: { controlId: created.id },
    });
  }),

  http.get("/api/v1/controls/:id", ({ params }) => {
    const id = Number(params.id);
    const target = commands.find((c) => c.id === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", errorCode: "CONTROL_NOT_FOUND", message: "제어 명령을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "상세 조회가 완료되었습니다.",
      data: {
        controlId: target.id,
        status: target.status,
        requestTime: target.requestTime,
        resultMessage: target.resultMessage,
      },
    });
  }),

  http.get("/api/v1/controls", ({ request }) => {
    const url = new URL(request.url);
    const zoneId = url.searchParams.get("zoneId");
    let filtered = commands.slice();
    if (zoneId !== null) filtered = filtered.filter((c) => c.zoneId === Number(zoneId));
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "조회 완료",
      data: {
        searchQuery: zoneId !== null ? { zoneId: Number(zoneId) } : {},
        totalCount: filtered.length,
        controlList: filtered.map((c) => ({
          id: c.id,
          deviceId: c.deviceId,
          command: c.command,
          status: c.status,
          requestTime: c.requestTime,
        })),
      },
    });
  }),
];
