// 대시보드 도메인 React Query 훅. 컴포넌트는 본 hook 만 사용한다.
import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "./api";
import { dashboardKeys } from "./queryKeys";
import type { RecentAccessQuery } from "./types";

/** 통합 요약 카드 4종 (총 직원·오늘 예약·활성 장치·승인 대기). */
export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: dashboardApi.getSummary,
  });
}

/** 구역별 실시간 환경 센서 현황. */
export function useDashboardSensorsCurrent() {
  return useQuery({
    queryKey: dashboardKeys.sensorsCurrent(),
    queryFn: dashboardApi.getSensorsCurrent,
  });
}

/** 오늘 근태 현황. */
export function useDashboardAttendanceToday() {
  return useQuery({
    queryKey: dashboardKeys.attendanceToday(),
    queryFn: dashboardApi.getAttendanceToday,
  });
}

/** 최근 출입 이벤트 목록. limit 기본 20, type 미지정 시 IN/OUT 전체. */
export function useDashboardRecentAccess(query?: RecentAccessQuery) {
  return useQuery({
    queryKey: dashboardKeys.recentAccess(query),
    queryFn: () => dashboardApi.getRecentAccess(query),
  });
}
