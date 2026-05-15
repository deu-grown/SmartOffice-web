// 주차(parking) 도메인 React Query 훅.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { parkingApi } from "./api";
import { parkingKeys } from "./queryKeys";
import type {
  ParkingSpotCreateRequest,
  ParkingSpotUpdateRequest,
  ParkingSpotsFilter,
} from "./types";

/** 주차면 보유 구역 목록. */
export function useParkingZones() {
  return useQuery({
    queryKey: parkingKeys.zones(),
    queryFn: () => parkingApi.zones(),
  });
}

/** 주차면 목록 (zoneId · spotType · status 필터). */
export function useParkingSpots(filter?: ParkingSpotsFilter) {
  return useQuery({
    queryKey: parkingKeys.spots.list(filter),
    queryFn: () => parkingApi.list(filter),
  });
}

/** 구역별 주차장 요약 (총/점유/여유 + spot 리스트). */
export function useParkingZoneSummary(zoneId: number | undefined) {
  return useQuery({
    queryKey: parkingKeys.zoneSummary(zoneId ?? -1),
    queryFn: () => parkingApi.zoneSummary(zoneId as number),
    enabled: typeof zoneId === "number" && zoneId > 0,
  });
}

/** 구역별 주차장 지도 (좌표 기반 평면도). */
export function useParkingZoneMap(zoneId: number | undefined) {
  return useQuery({
    queryKey: parkingKeys.zoneMap(zoneId ?? -1),
    queryFn: () => parkingApi.zoneMap(zoneId as number),
    enabled: typeof zoneId === "number" && zoneId > 0,
  });
}

/** 주차면 등록. */
export function useCreateSpot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ParkingSpotCreateRequest) => parkingApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parkingKeys.all });
    },
  });
}

/** 주차면 수정. */
export function useUpdateSpot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ParkingSpotUpdateRequest }) =>
      parkingApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parkingKeys.all });
    },
  });
}

/** 주차면 삭제. */
export function useDeleteSpot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => parkingApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parkingKeys.all });
    },
  });
}
