// 급여(salary) 도메인 React Query 훅. mutation 성공 시 records/settings 캐시 invalidate.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { salaryApi } from "./api";
import { salaryKeys } from "./queryKeys";
import type {
  SalaryCalculateRequest,
  SalaryRecordsQuery,
  SalarySettingCreateRequest,
  SalarySettingUpdateRequest,
} from "./types";

// ── record ──────────────────────────────────────────────────
/** 전체 급여 내역 (year/month 필수). */
export function useSalaryRecords(query: SalaryRecordsQuery) {
  return useQuery({
    queryKey: salaryKeys.records.list(query),
    queryFn: () => salaryApi.listRecords(query),
  });
}

/** 급여 산출 — 위험 액션. DRAFT 덮어쓰기, CONFIRMED 스킵. AttendanceBatchTriggerButton 패턴 적용 대상. */
export function useCalculateSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SalaryCalculateRequest) => salaryApi.calculate(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.records.all });
    },
  });
}

/** 급여 확정 (DRAFT → CONFIRMED). */
export function useConfirmSalaryRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salaryApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.records.all });
    },
  });
}

// ── setting ──────────────────────────────────────────────────
/** 급여 기준 목록 (position 필터 가능). */
export function useSalarySettings(position?: string) {
  return useQuery({
    queryKey: salaryKeys.settings.list(position),
    queryFn: () => salaryApi.listSettings(position),
  });
}

/** 급여 기준 등록. */
export function useCreateSalarySetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SalarySettingCreateRequest) => salaryApi.createSetting(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.settings.all });
    },
  });
}

/** 급여 기준 수정 (DELETE 미지원). */
export function useUpdateSalarySetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: SalarySettingUpdateRequest }) => salaryApi.updateSetting(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.settings.all });
    },
  });
}
