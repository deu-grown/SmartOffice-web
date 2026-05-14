// 전력 도메인 React Query 훅. G2 단계 hook 2 종 (current / billing).
// G7 진입 시 usePowerHourly / usePowerZoneBilling / useCalculatePowerBilling 등이 본 파일에 점진 추가될 예정.
import { useQuery } from "@tanstack/react-query";

import { powerApi } from "./api";
import { powerKeys } from "./queryKeys";
import type { PowerBillingQuery } from "./types";

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
