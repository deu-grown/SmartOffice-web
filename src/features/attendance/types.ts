// 백엔드 com.grown.smartoffice.domain.attendance.dto 패키지와 1:1 매핑.
// 본 features 는 ADMIN 3 엔드포인트(daily / PUT id / POST batch) 만 다룬다.
// 모바일 전용 cat 3 (me/daily · me/monthly) 는 본 플랜 범위 외.

/** AttendanceDailyResponse — GET /api/v1/attendance/daily 페이지 단건. */
export interface AttendanceDaily {
  attendanceId: number;
  userId: number;
  userName: string;
  workDate: string;
  checkIn: string | null;
  checkOut: string | null;
  workMinutes: number | null;
  overtimeMinutes: number | null;
  attendanceStatus: string;
  attendanceNote: string | null;
}

/** GET /api/v1/attendance/daily 쿼리 파라미터. date 필수. */
export interface AttendanceDailyFilter {
  date: string;
  name?: string;
  deptId?: number;
  page?: number;
  size?: number;
}

/** PUT /api/v1/attendance/{id} 요청 (AttendanceCorrectRequest). */
export interface AttendanceCorrectRequest {
  checkIn?: string;
  checkOut?: string;
  note?: string;
}

/** POST /api/v1/attendance/batch 요청 (BatchTriggerRequest). targetDate 필수. */
export interface AttendanceBatchTriggerRequest {
  targetDate: string;
}
