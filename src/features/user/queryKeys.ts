// 직원 도메인 TanStack Query 키 factory.
// access-logs 관련 키는 C9 에서 features/accesslog 로 이관 — 본 factory 에 없음.
import type { UserListFilter } from "./types";

export const userKeys = {
  all: ["user"] as const,
  list: (filter?: UserListFilter) =>
    [...userKeys.all, "list", filter ?? {}] as const,
  detail: (id: number) => [...userKeys.all, "detail", id] as const,
};
