// axios 클라이언트 인터셉터 단위/통합 테스트.
// - 401 발생 시 /auth/refresh 1회 시도 후 원요청 재시도
// - refresh 실패 시 토큰 정리 + ApiError throw
import { beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";

import { apiGet } from "@/src/lib/api/client";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/src/lib/api/tokenStorage";
import { server } from "@/src/test/server";

describe("apiClient interceptors", () => {
  beforeEach(() => {
    clearTokens();
  });

  it("401 발생 시 /auth/refresh 호출 후 원요청을 재시도해 데이터를 반환한다", async () => {
    setAccessToken("expired-token");
    setRefreshToken("valid-refresh");

    let firstCall = true;
    server.use(
      http.get("/api/v1/sample/protected", () => {
        if (firstCall) {
          firstCall = false;
          return HttpResponse.json(
            { code: "error", message: "만료된 액세스 토큰입니다.", data: null },
            { status: 401 },
          );
        }
        return HttpResponse.json({
          code: "success",
          message: "ok",
          data: { value: "ok" },
        });
      }),
      // refresh 핸들러는 handlers/auth.ts 기본 동작에 위임(성공 응답).
    );

    const data = await apiGet<{ value: string }>("/sample/protected");

    expect(data).toEqual({ value: "ok" });
    expect(getAccessToken()).toBe("new-mock-access-token");
  });

  it("refresh 실패 시 토큰을 정리하고 ApiError 를 throw 한다", async () => {
    setAccessToken("expired-token");
    setRefreshToken("invalid-refresh");

    server.use(
      http.get("/api/v1/sample/protected", () =>
        HttpResponse.json(
          { code: "error", message: "만료된 액세스 토큰입니다.", data: null },
          { status: 401 },
        ),
      ),
      http.post("/api/v1/auth/refresh", () =>
        HttpResponse.json(
          {
            code: "error",
            message: "Refresh Token이 만료되었습니다. 다시 로그인해주세요.",
            data: null,
          },
          { status: 403 },
        ),
      ),
    );

    await expect(apiGet("/sample/protected")).rejects.toMatchObject({
      name: "ApiError",
    });
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});
