// 전력 도메인 REST API 호출. G2 단계 2 함수(getCurrent / getAllBilling).
// G7 에서 getHourly / getZoneBilling / postCalculate 가 본 객체에 추가될 예정 — 호출 시그니처 호환을 위해 객체 export 방식 유지.
import { apiGet } from "@/src/lib/api/client";

import type { PowerBillingAll, PowerBillingQuery, PowerCurrent } from "./types";

export const powerApi = {
  /** 구역별 실시간 전력 현황. */
  getCurrent: (zoneId: number) =>
    apiGet<PowerCurrent>(`/power/zones/${zoneId}/current`),
  /** 전체 구역 월 요금 현황. year/month 미지정 시 백엔드 기본(당월) 적용. */
  getAllBilling: (query?: PowerBillingQuery) =>
    apiGet<PowerBillingAll>("/power/billing", { params: query }),
};
