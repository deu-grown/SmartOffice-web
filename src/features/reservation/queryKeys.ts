// 예약(reservation) 도메인 TanStack Query 키 factory.
// namespace ["reservation", ...] — 다른 도메인과 충돌 없음.
import type { ReservationListFilter } from "./types";

export const reservationKeys = {
  all: ["reservation"] as const,
  list: (filter?: ReservationListFilter) =>
    [...reservationKeys.all, "list", filter ?? {}] as const,
  detail: (id: number) => [...reservationKeys.all, "detail", id] as const,
  zone: (zoneId: number, date?: string) =>
    [...reservationKeys.all, "zone", zoneId, date ?? "today"] as const,
};
