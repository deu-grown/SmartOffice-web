// 장치(device) 도메인 REST API 호출 — 5 엔드포인트 1:1.
// 백엔드 GET /api/v1/devices 는 전체 목록만 제공 (zoneId 쿼리 파라미터 부재) — zone 필터링은 클라이언트 측 수행.
import { apiDelete, apiGet, apiPost, apiPut } from "@/src/lib/api/client";

import type {
  DeviceCreateRequest,
  DeviceCreateResponse,
  DeviceDetail,
  DeviceListItem,
  DeviceUpdateRequest,
  DeviceUpdateResponse,
} from "./types";

export const deviceApi = {
  /** 전체 장치 목록. (zone 필터는 클라이언트 측에서.) */
  list: () => apiGet<DeviceListItem[]>("/devices"),
  /** 장치 등록 (mqttTopic 은 백엔드 자동 생성). */
  create: (body: DeviceCreateRequest) =>
    apiPost<DeviceCreateResponse, DeviceCreateRequest>("/devices", body),
  /** 장치 상세. */
  detail: (id: number) => apiGet<DeviceDetail>(`/devices/${id}`),
  /** 장치 정보 수정. */
  update: (id: number, body: DeviceUpdateRequest) =>
    apiPut<DeviceUpdateResponse, DeviceUpdateRequest>(`/devices/${id}`, body),
  /** 장치 삭제. cascade 동작은 백엔드 책임. */
  remove: (id: number) => apiDelete<void>(`/devices/${id}`),
};
