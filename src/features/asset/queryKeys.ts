// 자산(asset) 도메인 TanStack Query 키 factory.
import type { AssetListFilter } from "./types";

export const assetKeys = {
  all: ["asset"] as const,
  list: (filter?: AssetListFilter) => [...assetKeys.all, "list", filter ?? {}] as const,
  detail: (id: number) => [...assetKeys.all, "detail", id] as const,
};
