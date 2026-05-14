// 부서 도메인 React Query 훅. mutation 성공 시 목록 캐시 invalidate.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { departmentApi } from "./api";
import { departmentKeys } from "./queryKeys";
import type {
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
} from "./types";

/** 전체 부서 목록 + 직원 수. */
export function useDepartments() {
  return useQuery({
    queryKey: departmentKeys.list(),
    queryFn: departmentApi.list,
  });
}

/** 부서 등록 mutation. */
export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: DepartmentCreateRequest) => departmentApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.list() });
    },
  });
}

/** 부서 수정 mutation. */
export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: DepartmentUpdateRequest }) =>
      departmentApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.list() });
    },
  });
}

/** 부서 삭제 mutation (소속 직원 없는 부서만 백엔드에서 허용). */
export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => departmentApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.list() });
    },
  });
}
