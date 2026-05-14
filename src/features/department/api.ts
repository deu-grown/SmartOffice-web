// 부서 도메인 REST API 호출 (4 엔드포인트). thin wrapper 만 정의.
import { apiDelete, apiGet, apiPost, apiPut } from "@/src/lib/api/client";

import type {
  Department,
  DepartmentCreateRequest,
  DepartmentCreateResponse,
  DepartmentUpdateRequest,
  DepartmentUpdateResponse,
} from "./types";

export const departmentApi = {
  /** 전체 부서 목록 + 각 부서 소속 직원 수. */
  list: () => apiGet<Department[]>("/departments"),
  /** 부서 등록. */
  create: (body: DepartmentCreateRequest) =>
    apiPost<DepartmentCreateResponse, DepartmentCreateRequest>("/departments", body),
  /** 부서 수정. */
  update: (id: number, body: DepartmentUpdateRequest) =>
    apiPut<DepartmentUpdateResponse, DepartmentUpdateRequest>(`/departments/${id}`, body),
  /** 부서 삭제 (소속 직원 없는 부서만). */
  remove: (id: number) => apiDelete<void>(`/departments/${id}`),
};
