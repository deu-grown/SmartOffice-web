// 직원 도메인 React Query 훅. mutation 성공 시 목록·상세 캐시 invalidate.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { userApi } from "./api";
import { userKeys } from "./queryKeys";
import type {
  UserAccessLogsQuery,
  UserCreateRequest,
  UserListFilter,
  UserUpdateRequest,
} from "./types";

/** 직원 목록 (필터·페이지네이션). */
export function useUsers(filter?: UserListFilter) {
  return useQuery({
    queryKey: userKeys.list(filter),
    queryFn: () => userApi.list(filter),
  });
}

/** 직원 상세. */
export function useUserDetail(id: number | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id ?? -1),
    queryFn: () => userApi.detail(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

/** 직원 등록. */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UserCreateRequest) => userApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

/** 직원 정보 수정. */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UserUpdateRequest }) =>
      userApi.update(id, body),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
    },
  });
}

/** 직원 퇴사 처리 (status=INACTIVE). 복구 불가. */
export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
    },
  });
}

/** 특정 직원 출입 이력 — C9 에서 features/accesslog 로 이관 예정. */
export function useUserAccessLogs(
  id: number | undefined,
  query?: UserAccessLogsQuery,
) {
  return useQuery({
    queryKey: userKeys.accessLogs(id ?? -1, query),
    queryFn: () => userApi.accessLogs(id as number, query),
    enabled: typeof id === "number" && id > 0,
  });
}
