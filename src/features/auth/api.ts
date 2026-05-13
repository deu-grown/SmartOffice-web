// 인증 도메인 REST API 호출 함수. apiClient(인터셉터·토큰 첨부 처리)를 사용한다.
import { apiGet, apiPost } from "@/src/lib/api/client";

import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
} from "./types";

export const authApi = {
  /** 이메일·비밀번호 로그인. */
  login: (body: LoginRequest) => apiPost<LoginResponse, LoginRequest>("/auth/login", body),
  /** 로그아웃 (Bearer 토큰 필요). 서버에서 refresh token 무효화. */
  logout: () => apiPost<void>("/auth/logout"),
  /** Refresh 토큰으로 Access 재발급. 인터셉터의 자동 refresh 와 별개로 명시 호출 가능. */
  refresh: (body: TokenRefreshRequest) =>
    apiPost<TokenRefreshResponse, TokenRefreshRequest>("/auth/refresh", body),
  /** 내 인증 정보 조회. */
  getMe: () => apiGet<MeResponse>("/auth/me"),
};
