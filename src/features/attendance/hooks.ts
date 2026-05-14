// 근태 도메인 React Query 훅. mutation 성공 시 daily 캐시 invalidate.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { attendanceApi } from "./api";
import { attendanceKeys } from "./queryKeys";
import type {
  AttendanceBatchTriggerRequest,
  AttendanceCorrectRequest,
  AttendanceDailyFilter,
} from "./types";

/** 임의 날짜 일별 근태 목록 + 페이지네이션. date 필수. */
export function useAttendanceDaily(filter: AttendanceDailyFilter) {
  return useQuery({
    queryKey: attendanceKeys.daily(filter),
    queryFn: () => attendanceApi.daily(filter),
    enabled: !!filter.date,
  });
}

/** 근태 수동 보정. ADMIN 한정. */
export function useCorrectAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AttendanceCorrectRequest }) =>
      attendanceApi.correct(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

/** 월간 근태 일괄 산출 수동 트리거. **위험 액션** (멱등 X — 기존 결과 덮어쓰기).
 *  호출 시점에 반드시 확인 모달을 거치고, 성공 응답(처리 건수)을 결과 모달로 노출한다. */
export function useTriggerAttendanceBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AttendanceBatchTriggerRequest) => attendanceApi.triggerBatch(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}
