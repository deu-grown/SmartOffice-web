// 출입 로그 도메인 REST API 호출.
// 본 features 는 GET /access-logs (ADMIN 전체) + GET /users/{id}/access-logs (특정 직원) 2 함수.
// 후자는 C6 features/user 에서 임시 inline 으로 보유했던 것을 C9 에 이관.
import { apiGet } from "@/src/lib/api/client";

import type {
  AccessLogFilter,
  AllAccessLogList,
  UserAccessLogList,
  UserAccessLogsQuery,
} from "./types";

export const accessLogApi = {
  /** 전체 출입 로그 조회 (ADMIN). 필터 8종. */
  list: (filter?: AccessLogFilter) =>
    apiGet<AllAccessLogList>("/access-logs", { params: filter }),
  /** 특정 직원 출입 이력. features/user.userApi.accessLogs 에서 이관. */
  userLogs: (id: number, query?: UserAccessLogsQuery) =>
    apiGet<UserAccessLogList>(`/users/${id}/access-logs`, { params: query }),
};
