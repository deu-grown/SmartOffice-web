// 차량(vehicle) 도메인 React Query 훅.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { vehicleApi } from "./api";
import { vehicleKeys } from "./queryKeys";
import type { VehicleCreateRequest, VehicleFilter, VehicleUpdateRequest } from "./types";

/** 차량 목록. */
export function useVehicles(filter?: VehicleFilter) {
  return useQuery({
    queryKey: vehicleKeys.list(filter),
    queryFn: () => vehicleApi.list(filter),
  });
}

/** 차량 등록. */
export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: VehicleCreateRequest) => vehicleApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}

/** 차량 정보 수정. */
export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: VehicleUpdateRequest }) =>
      vehicleApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}

/** 차량 삭제. */
export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => vehicleApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}
