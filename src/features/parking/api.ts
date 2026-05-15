// 주차(parking) 도메인 REST API 호출. zones + spots CRUD + zone summary/map.
import { apiDelete, apiGet, apiPost, apiPut } from "@/src/lib/api/client";

import type {
  ParkingReservationCreateRequest,
  ParkingReservationFilter,
  ParkingReservationListResponse,
  ParkingReservationResponse,
  ParkingSpotCreateRequest,
  ParkingSpotResponse,
  ParkingSpotUpdateRequest,
  ParkingSpotsFilter,
  ParkingZoneItem,
  ParkingZoneMapResponse,
  ParkingZoneSummaryResponse,
} from "./types";

export const parkingApi = {
  /** 주차면 보유 구역 목록. */
  zones: () => apiGet<ParkingZoneItem[]>("/parking/zones"),
  /** 주차면 목록 (zoneId · spotType · status 필터). */
  list: (filter?: ParkingSpotsFilter) =>
    apiGet<ParkingSpotResponse[]>("/parking/spots", { params: filter }),
  /** 주차면 등록. */
  create: (body: ParkingSpotCreateRequest) =>
    apiPost<ParkingSpotResponse, ParkingSpotCreateRequest>("/parking/spots", body),
  /** 주차면 수정. */
  update: (id: number, body: ParkingSpotUpdateRequest) =>
    apiPut<ParkingSpotResponse, ParkingSpotUpdateRequest>(`/parking/spots/${id}`, body),
  /** 주차면 삭제. */
  remove: (id: number) => apiDelete<void>(`/parking/spots/${id}`),
  /** 구역별 주차장 요약 (총/점유/여유 + spot 리스트). 인증만 요구 (cat 5). */
  zoneSummary: (zoneId: number) =>
    apiGet<ParkingZoneSummaryResponse>(`/parking/zones/${zoneId}/spots`),
  /** 구역별 주차장 지도 (좌표 기반 평면도). 인증만 요구 (cat 5). */
  zoneMap: (zoneId: number) => apiGet<ParkingZoneMapResponse>(`/parking/zones/${zoneId}/map`),
  /** 주차 예약 목록. */
  reservations: (filter?: ParkingReservationFilter) =>
    apiGet<ParkingReservationListResponse>("/parking/reservations", { params: filter }),
  /** 주차 예약 등록. */
  createReservation: (body: ParkingReservationCreateRequest) =>
    apiPost<ParkingReservationResponse, ParkingReservationCreateRequest>("/parking/reservations", body),
  /** 주차 예약 삭제. */
  removeReservation: (id: number) => apiDelete<void>(`/parking/reservations/${id}`),
};
