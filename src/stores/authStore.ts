// Zustand 기반 인증 스토어.
// 토큰 자체는 tokenStorage 가 관리하고, 이 스토어는 user 정보만 보관·persist 한다.
// 인터셉터(client.ts) 와 store 간 순환 의존을 방지하기 위해 토큰 setter/getter 는 tokenStorage 만 사용.
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { clearTokens, setAccessToken, setRefreshToken } from "@/src/lib/api/tokenStorage";
import type { User } from "@/src/types";

interface LoginPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  /** 로그인 성공 시 호출. 토큰은 tokenStorage 에 위임 저장. */
  login: (payload: LoginPayload) => void;
  /** 로그아웃. 토큰/사용자 상태 모두 정리. */
  logout: () => void;
  /** 사용자 정보만 갱신 (커밋 5 LoginPage 마이그레이션 전 임시 진입점). */
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: ({ user, accessToken, refreshToken }) => {
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        set({ user });
      },
      logout: () => {
        clearTokens();
        set({ user: null });
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: "smartoffice-auth",
      // user 만 persist. 토큰은 별도 키로 tokenStorage 가 보관한다.
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
