// 주차(parking) 도메인 TanStack Query 키 factory.
// namespace ["parking", ...] — zone/device/asset 와 충돌 없음.
import type { ParkingReservationFilter, ParkingSpotsFilter } from "./types";

export const parkingKeys = {
  all: ["parking"] as const,
  zones: () => [...parkingKeys.all, "zones"] as const,
  spots: {
    all: () => [...parkingKeys.all, "spots"] as const,
    list: (filter?: ParkingSpotsFilter) =>
      [...parkingKeys.spots.all(), "list", filter ?? {}] as const,
  },
  zoneSummary: (zoneId: number) => [...parkingKeys.all, "zoneSummary", zoneId] as const,
  zoneMap: (zoneId: number) => [...parkingKeys.all, "zoneMap", zoneId] as const,
  reservations: (filter?: ParkingReservationFilter) =>
    [...parkingKeys.all, "reservations", filter ?? {}] as const,
};
