// 전력 도메인 TanStack Query 키 factory.
import type { PowerBillingQuery, PowerBillingZoneQuery, PowerHourlyQuery } from "./types";

export const powerKeys = {
  all: ["power"] as const,
  zones: () => [...powerKeys.all, "zones"] as const,
  current: (zoneId: number) => [...powerKeys.all, "current", zoneId] as const,
  billing: (query?: PowerBillingQuery) =>
    [...powerKeys.all, "billing", query ?? {}] as const,
  hourly: (zoneId: number, query?: PowerHourlyQuery) =>
    [...powerKeys.all, "hourly", zoneId, query ?? {}] as const,
  zoneBilling: (zoneId: number, query?: PowerBillingZoneQuery) =>
    [...powerKeys.all, "zoneBilling", zoneId, query ?? {}] as const,
};
