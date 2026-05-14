// 센서(sensor) 도메인 React Query 훅.
import { useQuery } from "@tanstack/react-query";

import { sensorApi } from "./api";
import { sensorKeys } from "./queryKeys";

/** 구역별 최신 센서 데이터. zoneId 미지정 시 비활성. */
export function useSensorLatest(zoneId: number | undefined) {
  return useQuery({
    queryKey: sensorKeys.latest(zoneId ?? -1),
    queryFn: () => sensorApi.latest(zoneId as number),
    enabled: typeof zoneId === "number" && zoneId > 0,
  });
}

/** 구역별 센서 로그 이력 (날짜 범위). */
export function useSensorHistory(zoneId: number | undefined, startDate: string, endDate: string) {
  return useQuery({
    queryKey: sensorKeys.history(zoneId ?? -1, startDate, endDate),
    queryFn: () => sensorApi.history(zoneId as number, startDate, endDate),
    enabled: typeof zoneId === "number" && zoneId > 0 && Boolean(startDate) && Boolean(endDate),
  });
}
