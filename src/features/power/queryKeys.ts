// 전력 도메인 TanStack Query 키 factory. G2 단계는 current / billing 만 사용.
// G7 진입 시 hourly / zoneBilling / calculate 키가 동일 factory 에 추가될 예정.
import type { PowerBillingQuery } from "./types";

export const powerKeys = {
  all: ["power"] as const,
  current: (zoneId: number) => [...powerKeys.all, "current", zoneId] as const,
  billing: (query?: PowerBillingQuery) =>
    [...powerKeys.all, "billing", query ?? {}] as const,
};
