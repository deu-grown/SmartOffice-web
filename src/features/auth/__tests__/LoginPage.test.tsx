// LoginPage 통합 테스트.
// MSW 가 /api/v1/auth/login 응답을 가로채므로 실제 백엔드 기동 없이도 골든 패스 검증이 가능하다.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { LoginPage } from "@/src/components/auth/LoginPage";
import { clearTokens, getAccessToken } from "@/src/lib/api/tokenStorage";
import { useAuthStore } from "@/src/stores/authStore";
import { server } from "@/src/test/server";

function renderLoginPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null });
    clearTokens();
  });

  afterEach(() => {
    useAuthStore.setState({ user: null });
    clearTokens();
  });

  it("admin 계정으로 로그인 성공 시 대시보드 라우트로 이동하고 토큰이 저장된다", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    // LoginPage 초기 default 값이 admin@grown.com / EMP001 이므로 그대로 제출.
    await user.click(screen.getByRole("button", { name: "로그인하기" }));

    await waitFor(() => {
      expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    });

    expect(useAuthStore.getState().user?.email).toBe("admin@grown.com");
    expect(getAccessToken()).toBe("mock-access-token");
  });

  it("INVALID_CREDENTIALS 응답 시 user 상태가 갱신되지 않고 토큰이 저장되지 않는다", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const passwordInput = screen.getByLabelText("비밀번호");
    await user.clear(passwordInput);
    await user.type(passwordInput, "wrong-password");
    await user.click(screen.getByRole("button", { name: "로그인하기" }));

    await waitFor(() => {
      expect(useAuthStore.getState().user).toBeNull();
    });
    expect(getAccessToken()).toBeNull();
    expect(screen.queryByText("Dashboard Page")).not.toBeInTheDocument();
  });

  it("ACCOUNT_INACTIVE 응답을 받아도 user 상태는 유지되며 라우팅되지 않는다", async () => {
    server.use(
      http.post("/api/v1/auth/login", () =>
        HttpResponse.json(
          { code: "error", message: "퇴사 처리된 계정입니다.", data: null },
          { status: 403 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderLoginPage();
    await user.click(screen.getByRole("button", { name: "로그인하기" }));

    await waitFor(() => {
      expect(useAuthStore.getState().user).toBeNull();
    });
    expect(screen.queryByText("Dashboard Page")).not.toBeInTheDocument();
  });

  // 웹은 관리자 전용 클라이언트(10-Capstone CLAUDE.md 3절). USER 토큰은 로그인 직후 차단된다.
  it("USER 역할로 로그인 성공 응답을 받아도 즉시 세션을 비우고 진입을 차단한다", async () => {
    server.use(
      http.post("/api/v1/auth/login", () =>
        HttpResponse.json({
          code: "success",
          message: "로그인에 성공했습니다.",
          data: {
            accessToken: "mock-user-access-token",
            refreshToken: "mock-user-refresh-token",
            tokenType: "Bearer",
            expiresIn: 1800,
            user: {
              id: 3,
              email: "jang.bo@grown.com",
              name: "장보고",
              role: "USER",
              position: "개발자",
              department: "개발팀",
            },
          },
        }),
      ),
    );

    const user = userEvent.setup();
    renderLoginPage();
    await user.click(screen.getByRole("button", { name: "로그인하기" }));

    // 로그인 응답은 200 이지만 LoginPage onSuccess 에서 차단되어 store/token 모두 비어 있어야 한다.
    await waitFor(() => {
      expect(getAccessToken()).toBeNull();
    });
    expect(useAuthStore.getState().user).toBeNull();
    expect(screen.queryByText("Dashboard Page")).not.toBeInTheDocument();
  });
});
