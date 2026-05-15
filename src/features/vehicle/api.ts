// 차량(vehicle) 도메인 REST API 호출.
import { apiDelete, apiGet, apiPost, apiPut } from "@/src/lib/api/client";

import type {
  VehicleCreateRequest,
  VehicleFilter,
  VehicleListResponse,
  VehicleResponse,
  VehicleUpdateRequest,
} from "./types";

export const vehicleApi = {
  /** 차량 목록 (type · keyword 필터). */
  list: (filter?: VehicleFilter) =>
    apiGet<VehicleListResponse>("/vehicles", { params: filter }),
  /** 차량 단건 조회. */
  detail: (id: number) => apiGet<VehicleResponse>(`/vehicles/${id}`),
  /** 차량 등록. */
  create: (body: VehicleCreateRequest) =>
    apiPost<VehicleResponse, VehicleCreateRequest>("/vehicles", body),
  /** 차량 정보 수정. */
  update: (id: number, body: VehicleUpdateRequest) =>
    apiPut<VehicleResponse, VehicleUpdateRequest>(`/vehicles/${id}`, body),
  /** 차량 삭제. */
  remove: (id: number) => apiDelete<void>(`/vehicles/${id}`),
};
