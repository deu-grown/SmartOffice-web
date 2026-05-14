// 제어(control) 도메인 React Query 훅. 제어 발송 mutation 성공 시 history 캐시 invalidate.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { controlApi } from "./api";
import { controlKeys } from "./queryKeys";
import type { ControlRequest } from "./types";

/** 제어 명령 발송 (MQTT). */
export function useSendControl() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ControlRequest) => controlApi.send(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: controlKeys.all });
    },
  });
}

/** 제어 명령 상세/상태 조회. */
export function useControlDetail(id: number | undefined) {
  return useQuery({
    queryKey: controlKeys.detail(id ?? -1),
    queryFn: () => controlApi.detail(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

/** 제어 명령 이력. zoneId/startDate 필터. */
export function useControlHistory(zoneId?: number, startDate?: string) {
  return useQuery({
    queryKey: controlKeys.history(zoneId, startDate),
    queryFn: () => controlApi.history(zoneId, startDate),
  });
}
