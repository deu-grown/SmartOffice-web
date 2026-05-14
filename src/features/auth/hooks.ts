// 인증 도메인 React Query 훅.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ROUTES } from "@/src/routes/paths";
import { useAuthStore } from "@/src/stores/authStore";

import { authApi } from "./api";
import { authKeys } from "./queryKeys";
import type { LoginRequest } from "./types";

/**
 * 내 인증 정보 조회. user 가 store 에 있는 동안만 활성화.
 * 401 등 토큰 만료 시 axios 인터셉터가 refresh 또는 로그아웃을 처리한다.
 */
export function useMe(options?: { enabled?: boolean }) {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.getMe,
    enabled: (options?.enabled ?? true) && !!user,
    retry: false,
  });
}

/** 로그인 mutation. 성공 시 authStore 에 user/토큰 반영 후 useMe 캐시 무효화. */
export function useLoginMutation() {
  const queryClient = useQueryClient();
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: async (data) => {
      login({
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          position: data.user.position,
          department: data.user.department,
        },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

/** 로그아웃 mutation. 서버 호출 성패와 무관하게 클라이언트 상태/캐시를 정리한다. */
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
      toast.success("로그아웃되었습니다.");
      navigate(ROUTES.LOGIN, { replace: true });
    },
  });
}
