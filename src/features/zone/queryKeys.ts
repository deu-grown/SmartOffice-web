// 구역(zone) 도메인 TanStack Query 키 factory.
// detail(id) 키는 백엔드 GET /{id} 부재 우회용 (현재는 list 응답 find 로 추출) — BACKEND_SUGGESTIONS #10 채택 시
// hook 내부 useQuery 로 swap, 키 그대로 유지. namespace 분리: dashboardKeys(["dashboard", ...]) 와 충돌 없음.
import type { ZoneListFilter } from "./types";

export const zoneKeys = {
  all: ["zone"] as const,
  list: (filter?: ZoneListFilter) => [...zoneKeys.all, "list", filter ?? {}] as const,
  tree: () => [...zoneKeys.all, "tree"] as const,
  detail: (id: number) => [...zoneKeys.all, "detail", id] as const,
};
