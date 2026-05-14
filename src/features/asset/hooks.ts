// 자산(asset) 도메인 React Query 훅. mutation 성공 시 list/detail 캐시 invalidate.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { assetApi } from "./api";
import { assetKeys } from "./queryKeys";
import type { AssetCreateRequest, AssetListFilter, AssetUpdateRequest } from "./types";

/** 자산 목록 (필터·페이지네이션). */
export function useAssets(filter?: AssetListFilter) {
  return useQuery({
    queryKey: assetKeys.list(filter),
    queryFn: () => assetApi.list(filter),
  });
}

/** 자산 상세. */
export function useAssetDetail(id: number | undefined) {
  return useQuery({
    queryKey: assetKeys.detail(id ?? -1),
    queryFn: () => assetApi.detail(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

/** 자산 등록. */
export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AssetCreateRequest) => assetApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}

/** 자산 정보 수정. */
export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AssetUpdateRequest }) =>
      assetApi.update(id, body),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: assetKeys.list() });
    },
  });
}

/** 자산 삭제. */
export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => assetApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: assetKeys.list() });
    },
  });
}
