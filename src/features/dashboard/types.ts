// 백엔드 com.grown.smartoffice.domain.dashboard.dto 패키지와 1:1 매핑.
// 인터셉터에서 ApiResponse<T> 의 data 만 언래핑되어 내려오므로 여기서는 unwrapped 모양만 정의.

/** GET /api/v1/dashboard/summary 응답. */
export interface DashboardSummary {
  totalUsers: number;
  todayReservations: number;
  activeDevices: number;
  pendingApprovals: number;
}

/** GET /api/v1/dashboard/sensors/current 응답의 단건. BigDecimal 은 number 로 역직렬화되며,
 *  해당 구역에 센서 데이터가 없을 때 temp/humi/co2 는 null 로 내려온다 (백엔드 curl 검증 결과). */
export interface SensorCurrent {
  zoneId: number;
  zoneName: string;
  temp: number | null;
  humi: number | null;
  co2: number | null;
  updatedAt: string;
}

/** GET /api/v1/dashboard/attendance/today 응답. */
export interface AttendanceToday {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalExpected: number;
}

/** GET /api/v1/dashboard/access/recent 응답의 단건. type 은 "IN" | "OUT" 등 백엔드 direction 원본. */
export interface RecentAccess {
  id: number;
  userName: string;
  zoneName: string;
  accessTime: string;
  type: string;
}

/** GET /api/v1/dashboard/access/recent 쿼리 파라미터. */
export interface RecentAccessQuery {
  limit?: number;
  type?: string;
}
