// 직원 도메인 TanStack Query 키 factory.
// access-logs by id 는 임시로 본 factory 에 inline — C9 에서 features/accesslog 로 이관 예정.
import type { UserAccessLogsQuery, UserListFilter } from "./types";

export const userKeys = {
  all: ["user"] as const,
  list: (filter?: UserListFilter) =>
    [...userKeys.all, "list", filter ?? {}] as const,
  detail: (id: number) => [...userKeys.all, "detail", id] as const,
  accessLogs: (id: number, query?: UserAccessLogsQuery) =>
    [...userKeys.all, "accessLogs", id, query ?? {}] as const,
};
