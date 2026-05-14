// 장치(device) 도메인 React Query 훅. mutation 성공 시 list/detail 캐시 invalidate.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deviceApi } from "./api";
import { deviceKeys } from "./queryKeys";
import type { DeviceCreateRequest, DeviceUpdateRequest } from "./types";

/** 전체 장치 목록 (zone 필터는 호출처 클라이언트). */
export function useDevices() {
  return useQuery({
    queryKey: deviceKeys.list(),
    queryFn: () => deviceApi.list(),
  });
}

/** 장치 상세. */
export function useDeviceDetail(id: number | undefined) {
  return useQuery({
    queryKey: deviceKeys.detail(id ?? -1),
    queryFn: () => deviceApi.detail(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

/** 장치 등록. */
export function useCreateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: DeviceCreateRequest) => deviceApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

/** 장치 수정. */
export function useUpdateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: DeviceUpdateRequest }) => deviceApi.update(id, body),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: deviceKeys.list() });
    },
  });
}

/** 장치 삭제. */
export function useDeleteDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deviceApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}
