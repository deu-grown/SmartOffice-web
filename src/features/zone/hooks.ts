// 구역(zone) 도메인 React Query 훅. mutation 성공 시 list/tree/detail 캐시 invalidate.
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { zoneApi } from "./api";
import { zoneKeys } from "./queryKeys";
import type { ZoneCreateRequest, ZoneListFilter, ZoneUpdateRequest } from "./types";

/** 구역 목록 (parentId·zoneType 필터 가능). */
export function useZones(filter?: ZoneListFilter) {
  return useQuery({
    queryKey: zoneKeys.list(filter),
    queryFn: () => zoneApi.list(filter),
  });
}

/** 구역 트리 (재귀 children). */
export function useZoneTree() {
  return useQuery({
    queryKey: zoneKeys.tree(),
    queryFn: () => zoneApi.tree(),
  });
}

/** 구역 상세.
 *  TODO[BACKEND_SUGGESTIONS #10]: GET /api/v1/zones/{id} 도입 시 useQuery 로 swap
 *  (queryKey 는 zoneKeys.detail(id) 그대로 유지). 현재는 useZones() list 응답에서 find. */
export function useZoneDetail(id: number | undefined) {
  const listQuery = useZones();
  const detail = useMemo(
    () => (typeof id === "number" && listQuery.data ? listQuery.data.find((z) => z.id === id) : undefined),
    [id, listQuery.data]
  );
  return {
    data: detail,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    isFetching: listQuery.isFetching,
  };
}

/** 구역 등록. */
export function useCreateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ZoneCreateRequest) => zoneApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.all });
    },
  });
}

/** 구역 수정. */
export function useUpdateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ZoneUpdateRequest }) => zoneApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.all });
    },
  });
}

/** 구역 삭제 — 하위 구역 또는 설치 장치 존재 시 백엔드 409 응답. */
export function useDeleteZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => zoneApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.all });
    },
  });
}
