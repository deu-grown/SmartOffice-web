// 출입 로그 도메인 TanStack Query 키 factory.
import type { AccessLogFilter, UserAccessLogsQuery } from "./types";

export const accessLogKeys = {
  all: ["accesslog"] as const,
  list: (filter?: AccessLogFilter) =>
    [...accessLogKeys.all, "list", filter ?? {}] as const,
  user: (id: number, query?: UserAccessLogsQuery) =>
    [...accessLogKeys.all, "user", id, query ?? {}] as const,
};
