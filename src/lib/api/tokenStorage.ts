// 토큰 보관 단일 진입점.
// authStore 와 axios 인터셉터(client.ts) 간의 순환 의존을 차단하기 위해 별도 모듈로 분리한다.
// 모든 토큰 접근은 이 모듈을 통과해야 한다.

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return safeStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function setAccessToken(token: string): void {
  safeStorage()?.setItem(ACCESS_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  return safeStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
}

export function setRefreshToken(token: string): void {
  safeStorage()?.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearTokens(): void {
  const storage = safeStorage();
  if (!storage) return;
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
}
