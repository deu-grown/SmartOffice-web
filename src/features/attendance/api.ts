// 근태 도메인 REST API 호출 — ADMIN 3 엔드포인트.
import { apiGet, apiPost, apiPut } from "@/src/lib/api/client";
import type { PageResponse } from "@/src/lib/api/types";

import type {
  AttendanceBatchTriggerRequest,
  AttendanceCorrectRequest,
  AttendanceDaily,
  AttendanceDailyFilter,
} from "./types";

export const attendanceApi = {
  /** 임의 날짜 일별 근태 목록. date 필수. */
  daily: (filter: AttendanceDailyFilter) =>
    apiGet<PageResponse<AttendanceDaily>>("/attendance/daily", { params: filter }),
  /** 근태 수동 보정. checkIn/checkOut/note 부분 갱신. */
  correct: (id: number, body: AttendanceCorrectRequest) =>
    apiPut<void, AttendanceCorrectRequest>(`/attendance/${id}`, body),
  /** 월간 근태 일괄 산출 수동 트리거 (위험 액션 — 멱등 X). 응답은 처리 건수. */
  triggerBatch: (body: AttendanceBatchTriggerRequest) =>
    apiPost<number, AttendanceBatchTriggerRequest>("/attendance/batch", body),
};
