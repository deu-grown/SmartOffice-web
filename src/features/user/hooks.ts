// 직원 도메인 React Query 훅. mutation 성공 시 목록·상세 캐시 invalidate.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authKeys } from "@/src/features/auth/queryKeys";

import { userApi } from "./api";
import { userKeys } from "./queryKeys";
import type {
  UserCreateRequest,
  UserListFilter,
  UserMeUpdateRequest,
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

// useUserAccessLogs 는 C9 에서 features/accesslog/hooks.ts 로 이관 — 본 파일에 없음.

/** cat 5 본인 정보 수정 (POST /users/me).
 *  GET 본인 정보는 features/auth.useMe 재사용. 성공 시 authKeys.me() 캐시 invalidate. */
export function useUpdateMyInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UserMeUpdateRequest) => userApi.updateMyInfo(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}
