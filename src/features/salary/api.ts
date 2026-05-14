// 급여(salary) 도메인 REST API 호출 — 6 ADMIN 엔드포인트 (record 4 + setting 3 − 모바일 me 1).
// setting DELETE 미지원 (직급 기준 데이터 invariant 보호 의도).
import { apiGet, apiPost, apiPut } from "@/src/lib/api/client";
import type { PageResponse } from "@/src/lib/api/types";

import type {
  SalaryCalculateRequest,
  SalaryCalculateResponse,
  SalaryRecord,
  SalaryRecordsQuery,
  SalarySetting,
  SalarySettingCreateRequest,
  SalarySettingUpdateRequest,
} from "./types";

export const salaryApi = {
  // ── record ────────────────────────────────────────────────
  /** 전체 급여 내역 (페이지네이션). */
  listRecords: (query: SalaryRecordsQuery) =>
    apiGet<PageResponse<SalaryRecord>>("/salary/records", { params: query }),
  /** 급여 산출 — 위험 액션. DRAFT 덮어쓰기, CONFIRMED 스킵. */
  calculate: (body: SalaryCalculateRequest) =>
    apiPost<SalaryCalculateResponse, SalaryCalculateRequest>("/salary/records/calculate", body),
  /** 급여 확정 (DRAFT → CONFIRMED). 이후 재계산 대상 제외. */
  confirm: (id: number) => apiPut<SalaryRecord, Record<string, never>>(`/salary/records/${id}/confirm`, {}),

  // ── setting ────────────────────────────────────────────────
  /** 급여 기준 목록 (position 필터 가능). */
  listSettings: (position?: string) =>
    apiGet<SalarySetting[]>("/salary/settings", { params: position !== undefined ? { position } : undefined }),
  /** 급여 기준 등록. */
  createSetting: (body: SalarySettingCreateRequest) =>
    apiPost<SalarySetting, SalarySettingCreateRequest>("/salary/settings", body),
  /** 급여 기준 수정. DELETE 미지원 (백엔드 정책). */
  updateSetting: (id: number, body: SalarySettingUpdateRequest) =>
    apiPut<SalarySetting, SalarySettingUpdateRequest>(`/salary/settings/${id}`, body),
};
