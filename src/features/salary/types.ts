// 급여(salary) 도메인 타입 — 백엔드 DTO 와 1:1 매핑.
// SalaryStatus enum: DRAFT | CONFIRMED. record 4 + setting 3 (DELETE 미지원) = 6 ADMIN 엔드포인트.

export type SalaryStatus = "DRAFT" | "CONFIRMED";

/** GET /api/v1/salary/records 페이지 응답 항목 (= 산출 응답의 records 항목). */
export interface SalaryRecord {
  id: number;
  userId: number;
  userName: string;
  year: number;
  month: number;
  baseSalary: number;
  overtimePay: number;
  totalPay: number;
  status: SalaryStatus;
}

/** GET /api/v1/salary/records 쿼리. */
export interface SalaryRecordsQuery {
  year: number;
  month: number;
  userId?: number;
  status?: SalaryStatus;
  page?: number;
  size?: number;
}

/** POST /api/v1/salary/records/calculate 요청. userIds 미지정 시 전체 직원. */
export interface SalaryCalculateRequest {
  year: number;
  month: number;
  userIds?: number[];
}

/** POST /api/v1/salary/records/calculate 응답. */
export interface SalaryCalculateResponse {
  totalCount: number;
  successCount: number;
  skipCount: number;
  records: SalaryRecord[];
}

/** GET /api/v1/salary/settings 응답 항목. */
export interface SalarySetting {
  id: number;
  position: string;
  baseSalary: number;
  /** 백엔드 BigDecimal → JSON 직렬화 시 string 가능 — 호환 위해 string|number 허용. */
  overtimeRate: string | number;
  nightRate: string | number;
  effectiveFrom: string; // ISO LocalDate
  effectiveTo: string | null;
}

/** POST /api/v1/salary/settings 요청. */
export interface SalarySettingCreateRequest {
  position: string;
  baseSalary: number;
  overtimeRate?: number;
  nightRate?: number;
  effectiveFrom: string; // ISO LocalDate
}

/** PUT /api/v1/salary/settings/{id} 요청. */
export interface SalarySettingUpdateRequest {
  baseSalary?: number;
  overtimeRate?: number;
  nightRate?: number;
}
