/// <reference types="vite/client" />
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App.tsx";
import { LoginPage } from "./components/auth/LoginPage";
import { QueryProvider } from "./providers/QueryProvider";
import { PrivateRoute, PublicOnlyRoute } from "./routes/guards";
import { ROUTES } from "./routes/paths";
import { useAuthStore } from "./stores/authStore";
import type { User } from "./types";

import "./index.css";

/**
 * LoginPage 어댑터.
 * 현 LoginPage 는 onLogin(user) 콜백으로 인증 완료를 알리고, 토큰은 자체적으로 localStorage 에 저장한다.
 * tokenStorage 가 사용하는 키("accessToken" / "refreshToken")와 호환되므로 본 어댑터에서는 user 정보만 store 에 반영한다.
 * 커밋 5 에서 LoginPage 를 TanStack Query 기반으로 마이그레이션하면서 authStore.login 으로 통합 예정.
 */
function LoginRoute() {
  const setUser = useAuthStore((s) => s.setUser);
  return <LoginPage onLogin={(user: User) => setUser(user)} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicOnlyRoute>
                <LoginRoute />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <App />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  </StrictMode>,
);
