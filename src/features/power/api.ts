// 전력 도메인 REST API 호출.
import { apiGet, apiPost } from "@/src/lib/api/client";

import type {
  PowerBillingAll,
  PowerBillingCalculateRequest,
  PowerBillingCalculateResponse,
  PowerBillingQuery,
  PowerBillingZone,
  PowerBillingZoneQuery,
  PowerCurrent,
  PowerHourly,
  PowerHourlyQuery,
  PowerZoneItem,
} from "./types";

export const powerApi = {
  /** POWER 미터가 설치된 구역 목록. */
  getZones: () => apiGet<PowerZoneItem[]>("/power/zones"),
  /** 구역별 실시간 전력 현황. */
  getCurrent: (zoneId: number) =>
    apiGet<PowerCurrent>(`/power/zones/${zoneId}/current`),
  /** 전체 구역 월 요금 현황. year/month 미지정 시 백엔드 기본(당월) 적용. */
  getAllBilling: (query?: PowerBillingQuery) =>
    apiGet<PowerBillingAll>("/power/billing", { params: query }),
  // ── G7 확장 ────────────────────────────────────────────────
  /** 구역별 시간별 전력 이력. */
  getHourly: (zoneId: number, query?: PowerHourlyQuery) =>
    apiGet<PowerHourly>(`/power/zones/${zoneId}/hourly`, { params: query }),
  /** 구역별 월 요금 내역. */
  getZoneBilling: (zoneId: number, query?: PowerBillingZoneQuery) =>
    apiGet<PowerBillingZone>(`/power/zones/${zoneId}/billing`, { params: query }),
  /** 전력 요금 산출 (위험 액션, 멱등 X). */
  postCalculate: (body: PowerBillingCalculateRequest) =>
    apiPost<PowerBillingCalculateResponse, PowerBillingCalculateRequest>("/power/billing/calculate", body),
};
