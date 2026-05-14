// 전력 도메인 React Query 훅. G2(current/billing) + G7(hourly/zoneBilling/calculate) 확장.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { powerApi } from "./api";
import { powerKeys } from "./queryKeys";
import type {
  PowerBillingCalculateRequest,
  PowerBillingQuery,
  PowerBillingZoneQuery,
  PowerHourlyQuery,
} from "./types";

/** 구역별 실시간 전력 현황. zoneId 미지정 시 비활성. */
export function usePowerCurrent(zoneId: number | undefined) {
  return useQuery({
    queryKey: powerKeys.current(zoneId ?? -1),
    queryFn: () => powerApi.getCurrent(zoneId as number),
    enabled: typeof zoneId === "number" && zoneId > 0,
  });
}

/** 전체 구역 월 요금 현황. year/month 미지정 시 백엔드 기본 (당월) 적용. */
export function usePowerBilling(query?: PowerBillingQuery) {
  return useQuery({
    queryKey: powerKeys.billing(query),
    queryFn: () => powerApi.getAllBilling(query),
  });
}

// ── G7 확장 ──────────────────────────────────────────────────

/** 구역별 시간별 전력 이력. */
export function usePowerHourly(zoneId: number | undefined, query?: PowerHourlyQuery) {
  return useQuery({
    queryKey: powerKeys.hourly(zoneId ?? -1, query),
    queryFn: () => powerApi.getHourly(zoneId as number, query),
    enabled: typeof zoneId === "number" && zoneId > 0,
  });
}

/** 구역별 월 요금 내역. */
export function usePowerZoneBilling(zoneId: number | undefined, query?: PowerBillingZoneQuery) {
  return useQuery({
    queryKey: powerKeys.zoneBilling(zoneId ?? -1, query),
    queryFn: () => powerApi.getZoneBilling(zoneId as number, query),
    enabled: typeof zoneId === "number" && zoneId > 0,
  });
}

/** 전력 요금 산출 (위험 액션, 멱등 X). AttendanceBatchTriggerButton 패턴 적용 대상. */
export function useCalculatePowerBilling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PowerBillingCalculateRequest) => powerApi.postCalculate(body),
    onSuccess: () => {
      // 산출 후 billing 캐시 전체 invalidate (현재 month, 모든 zone)
      queryClient.invalidateQueries({ queryKey: powerKeys.all });
    },
  });
}
