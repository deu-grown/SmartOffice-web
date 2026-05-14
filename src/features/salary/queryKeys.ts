// 급여(salary) 도메인 TanStack Query 키 factory. record/setting namespace 분리.
import type { SalaryRecordsQuery } from "./types";

export const salaryKeys = {
  all: ["salary"] as const,
  records: {
    all: ["salary", "records"] as const,
    list: (query: SalaryRecordsQuery) => ["salary", "records", "list", query] as const,
  },
  settings: {
    all: ["salary", "settings"] as const,
    list: (position?: string) => ["salary", "settings", "list", position ?? null] as const,
  },
};
