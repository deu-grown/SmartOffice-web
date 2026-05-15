// 인증 도메인 MSW 핸들러. 백엔드 실제 curl 검증 결과의 응답 형태를 그대로 모방한다.
import { http, HttpResponse } from "msw";

const adminUser = {
  id: 1,
  email: "admin@grown.com",
  name: "관리자",
  role: "ADMIN",
  position: "팀장",
  department: "개발팀",
};

export const authHandlers = [
  http.post("/api/v1/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === "admin@grown.com" && body.password === "EMP001") {
      return HttpResponse.json({
        code: "success",
        errorCode: null,
        message: "로그인에 성공했습니다.",
        data: {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
          tokenType: "Bearer",
          expiresIn: 1800,
          user: adminUser,
        },
      });
    }
    return HttpResponse.json(
      {
        code: "error",
        errorCode: "INVALID_CREDENTIALS",
        message: "이메일 또는 비밀번호가 일치하지 않습니다.",
        data: null,
      },
      { status: 401 },
    );
  }),

  http.get("/api/v1/auth/me", () =>
    HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "정상 조회되었습니다.",
      data: {
        id: 1,
        employeeNumber: "EMP001",
        name: "관리자",
        email: "admin@grown.com",
        role: "ADMIN",
        position: "팀장",
        department: "개발팀",
        phone: "010-0000-0000",
        hiredAt: "2026-03-02",
        status: "ACTIVE",
      },
    }),
  ),

  http.post("/api/v1/auth/refresh", async ({ request }) => {
    const body = (await request.json()) as { refreshToken?: string };
    if (!body.refreshToken) {
      return HttpResponse.json(
        { code: "error", errorCode: "MISSING_REQUIRED_FIELD", message: "refreshToken은 필수입니다.", data: null },
        { status: 400 },
      );
    }
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "토큰이 재발급되었습니다.",
      data: {
        accessToken: "new-mock-access-token",
        tokenType: "Bearer",
        expiresIn: 1800,
      },
    });
  }),

  http.post("/api/v1/auth/logout", () =>
    HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "로그아웃 되었습니다.",
      data: null,
    }),
  ),
];
