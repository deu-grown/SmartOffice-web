// 공통 axios 클라이언트.
// - baseURL: VITE_API_URL 환경변수 우선 (운영). 미정의 시 "/api/v1" same-origin (dev vite proxy / prod server.ts proxy 또는 인프라 reverse-proxy).
// - 요청 인터셉터: tokenStorage 에서 Access Token 을 읽어 Authorization Bearer 첨부
// - 응답 인터셉터: ApiResponse<T> 래퍼 자동 언래핑. code !== "success" 이거나 HTTP 에러면 ApiError throw.
// - 401 발생 시: /auth/refresh 1회 시도 → 성공 시 원요청 재시도, 실패 시 토큰 정리 + /login 이동.
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./tokenStorage";
import { ApiError, type ApiResponse } from "./types";

// VITE_API_URL: prod 빌드에서 절대 URL 사용 시 정의 (.env.production). 비어있거나 미정의면 same-origin "/api/v1".
const API_URL = import.meta.env.VITE_API_URL?.trim();
const BASE_URL = API_URL ? `${API_URL.replace(/\/$/, "")}/api/v1` : "/api/v1";
const REFRESH_PATH = "/auth/refresh";
const LOGIN_API_PATH = "/auth/login";
const LOGIN_PATH = "/login";

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
  // httpOnly 쿠키(refreshToken) 자동 전송을 위해 withCredentials 활성화.
  withCredentials: true,
});

// ── 요청: Authorization Bearer 자동 첨부 ─────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// ── refresh 동시 호출 합치기 ──────────────────────────────────────────
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  // 쿠키 우선: body 없이 POST (백엔드 PR #28 — httpOnly 쿠키에서 refreshToken 추출).
  // refresh 호출 자체는 인터셉터를 거치지 않도록 raw axios 로 호출.
  try {
    const response = await axios.post<
      ApiResponse<{ accessToken: string; refreshToken?: string }>
    >(
      `${BASE_URL}${REFRESH_PATH}`,
      null,
      { headers: { "Content-Type": "application/json" }, withCredentials: true },
    );
    const payload = response.data;
    if (payload?.code === "success" && payload.data?.accessToken) {
      setAccessToken(payload.data.accessToken);
      if (payload.data.refreshToken) {
        setRefreshToken(payload.data.refreshToken);
      }
      return payload.data.accessToken;
    }
  } catch {
    // 쿠키 방식 실패 — localStorage refreshToken 으로 폴백.
  }

  // body 폴백: localStorage 에 refreshToken 이 있으면 body 에 포함하여 재시도.
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post<
      ApiResponse<{ accessToken: string; refreshToken?: string }>
    >(
      `${BASE_URL}${REFRESH_PATH}`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    const payload = response.data;
    if (payload?.code === "success" && payload.data?.accessToken) {
      setAccessToken(payload.data.accessToken);
      if (payload.data.refreshToken) {
        setRefreshToken(payload.data.refreshToken);
      }
      return payload.data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

// zustand persist storage 키 — authStore.ts 의 persist({ name }) 와 일치해야 한다.
// 본 식별자만 동기 의존 (zustand store 직접 import 시 순환 의존 우려가 있으므로 localStorage 키만 사용).
const AUTH_STORE_KEY = "smartoffice-auth";

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  // user store 도 함께 정리한다. 그렇지 않으면 PublicOnlyRoute 가 user 만 보고 /dashboard 로 즉시 되돌리면서
  // 무한 풀 리로드 점멸이 발생한다 (토큰 만료 + user persist 잔존 시).
  try {
    window.localStorage.removeItem(AUTH_STORE_KEY);
  } catch {
    /* localStorage 접근 불가 환경은 무시 */
  }
  if (window.location.pathname === LOGIN_PATH) return;
  window.location.href = LOGIN_PATH;
}

// ── 응답: ApiResponse 언래핑 + 401 refresh 처리 ───────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const payload = response.data;
    // ApiResponse 래퍼가 아닌 응답(예: 빈 본문)인 경우 그대로 통과.
    if (!payload || typeof payload !== "object" || !("code" in payload)) {
      return response;
    }
    if (payload.code === "success") {
      return { ...response, data: payload.data } as AxiosResponse;
    }
    throw new ApiError(
      response.status,
      payload.message ?? "요청에 실패했습니다.",
      payload.errorCode ?? null,
    );
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status ?? 0;
    const serverMessage = error.response?.data?.message;
    const original = error.config as RetryableConfig | undefined;
    const isRefreshCall = original?.url?.endsWith(REFRESH_PATH) ?? false;
    // 로그인 요청 자체가 401을 반환한 경우(자격증명 오류) refresh 대상에서 제외.
    const isLoginCall = original?.url?.endsWith(LOGIN_API_PATH) ?? false;

    if (status === 401 && original && !original._retried && !isRefreshCall && !isLoginCall) {
      original._retried = true;
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient.request(original);
      }
      clearTokens();
      redirectToLogin();
    }

    throw new ApiError(
      status,
      serverMessage ?? error.message ?? "네트워크 오류가 발생했습니다.",
      error.response?.data?.errorCode ?? null,
    );
  },
);

// ── 제네릭 헬퍼 ───────────────────────────────────────────────────────
// 인터셉터에서 ApiResponse.data 까지 언래핑하므로 res.data 가 곧 T.

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function apiPost<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.post<T>(url, body, config);
  return res.data;
}

export async function apiPut<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.put<T>(url, body, config);
  return res.data;
}

export async function apiDelete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
}
