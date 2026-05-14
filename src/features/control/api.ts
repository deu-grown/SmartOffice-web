// 제어(control) 도메인 REST API 호출 — 3 ADMIN 엔드포인트.
import { apiGet, apiPost } from "@/src/lib/api/client";

import type {
  ControlDetail,
  ControlHistoryResponse,
  ControlRequest,
  ControlResponse,
} from "./types";

export const controlApi = {
  /** 제어 명령 발송 (MQTT). 즉시 응답 + 상태는 별도 조회. */
  send: (body: ControlRequest) =>
    apiPost<ControlResponse, ControlRequest>("/controls", body),
  /** 제어 명령 상세/상태 조회. */
  detail: (id: number) => apiGet<ControlDetail>(`/controls/${id}`),
  /** 제어 명령 이력 (zoneId/startDate 필터). */
  history: (zoneId?: number, startDate?: string) =>
    apiGet<ControlHistoryResponse>("/controls", {
      params: {
        ...(zoneId !== undefined ? { zoneId } : {}),
        ...(startDate ? { startDate } : {}),
      },
    }),
};
