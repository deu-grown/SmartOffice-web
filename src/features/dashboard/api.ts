// 대시보드 도메인 REST API 호출. apiClient(인터셉터 + 토큰 첨부 + ApiResponse 언래핑)를 통해 thin wrapper 로만 구성.
import { apiGet } from "@/src/lib/api/client";

import type {
  AttendanceToday,
  DashboardSummary,
  RecentAccess,
  RecentAccessQuery,
  SensorCurrent,
} from "./types";

export const dashboardApi = {
  /** 통합 요약 카드 (총 직원·오늘 예약·활성 장치·승인 대기). */
  getSummary: () => apiGet<DashboardSummary>("/dashboard/summary"),
  /** 구역별 실시간 환경 센서 현황 배열. 데이터 없으면 빈 배열. */
  getSensorsCurrent: () => apiGet<SensorCurrent[]>("/dashboard/sensors/current"),
  /** 오늘 근태 현황 (출근/결근/지각/예상 총원). */
  getAttendanceToday: () => apiGet<AttendanceToday>("/dashboard/attendance/today"),
  /** 최근 출입 이벤트 목록. limit 기본 20, type 미지정 시 IN/OUT 전체. */
  getRecentAccess: (query?: RecentAccessQuery) =>
    apiGet<RecentAccess[]>("/dashboard/access/recent", { params: query }),
};
