// 공통 axios 클라이언트.
// - baseURL "/api/v1" 를 통과 (dev: vite proxy → localhost:8080, prod: 인프라 reverse-proxy 또는 same-origin)
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

const BASE_URL = "/api/v1";
const REFRESH_PATH = "/auth/refresh";
const LOGIN_PATH = "/login";

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
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
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    // refresh 호출 자체는 인터셉터를 거치지 않도록 raw axios 로 호출.
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

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
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
    throw new ApiError(response.status, payload.message ?? "요청에 실패했습니다.");
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status ?? 0;
    const serverMessage = error.response?.data?.message;
    const original = error.config as RetryableConfig | undefined;
    const isRefreshCall = original?.url?.endsWith(REFRESH_PATH) ?? false;

    if (status === 401 && original && !original._retried && !isRefreshCall) {
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

    throw new ApiError(status, serverMessage ?? error.message ?? "네트워크 오류가 발생했습니다.");
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
