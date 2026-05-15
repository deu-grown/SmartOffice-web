// 차량(vehicle) 도메인 TanStack Query 키 factory.
import type { VehicleFilter } from "./types";

export const vehicleKeys = {
  all: ["vehicle"] as const,
  list: (filter?: VehicleFilter) => [...vehicleKeys.all, "list", filter ?? {}] as const,
  detail: (id: number) => [...vehicleKeys.all, "detail", id] as const,
};
