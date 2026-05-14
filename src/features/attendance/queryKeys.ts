// 근태 도메인 TanStack Query 키 factory.
import type { AttendanceDailyFilter } from "./types";

export const attendanceKeys = {
  all: ["attendance"] as const,
  daily: (filter?: AttendanceDailyFilter) =>
    [...attendanceKeys.all, "daily", filter ?? {}] as const,
};
