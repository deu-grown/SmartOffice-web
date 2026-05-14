// 출입 로그 도메인 React Query 훅. ADMIN 전체 + 특정 직원 2 hook.
import { useQuery } from "@tanstack/react-query";

import { accessLogApi } from "./api";
import { accessLogKeys } from "./queryKeys";
import type { AccessLogFilter, UserAccessLogsQuery } from "./types";

/** 전체 출입 로그 (ADMIN). 필터 8종 + 페이지네이션. */
export function useAccessLogs(filter?: AccessLogFilter) {
  return useQuery({
    queryKey: accessLogKeys.list(filter),
    queryFn: () => accessLogApi.list(filter),
  });
}

/** 특정 직원 출입 이력 (G3 PersonnelDetailDrawer 가 사용). */
export function useUserAccessLogs(
  id: number | undefined,
  query?: UserAccessLogsQuery,
) {
  return useQuery({
    queryKey: accessLogKeys.user(id ?? -1, query),
    queryFn: () => accessLogApi.userLogs(id as number, query),
    enabled: typeof id === "number" && id > 0,
  });
}
