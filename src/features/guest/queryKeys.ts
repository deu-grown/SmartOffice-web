// 방문객(guest) 도메인 TanStack Query 키 factory.
import type { GuestFilter } from "./types";

export const guestKeys = {
  all: ["guest"] as const,
  list: (filter?: GuestFilter) => [...guestKeys.all, "list", filter ?? {}] as const,
  detail: (id: number) => [...guestKeys.all, "detail", id] as const,
};
