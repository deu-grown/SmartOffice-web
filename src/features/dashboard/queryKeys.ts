// 대시보드 도메인 TanStack Query 키 factory. invalidate 누락 방지를 위해 한 곳에서 관리.
import type { RecentAccessQuery } from "./types";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
  sensorsCurrent: () => [...dashboardKeys.all, "sensors", "current"] as const,
  attendanceToday: () => [...dashboardKeys.all, "attendance", "today"] as const,
  recentAccess: (query?: RecentAccessQuery) =>
    [...dashboardKeys.all, "access", "recent", query ?? {}] as const,
};
