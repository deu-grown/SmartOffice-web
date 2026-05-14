// 라우트 가드 컴포넌트.
// PrivateRoute : 인증 필요. 미인증 시 로그인으로 리다이렉트.
// AdminRoute   : ADMIN 역할만 허용. 비-ADMIN 은 대시보드로.
// PublicOnlyRoute : 이미 인증된 사용자가 /login 등에 접근하면 대시보드로.
import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { getAccessToken } from "@/src/lib/api/tokenStorage";
import { useAuthStore } from "@/src/stores/authStore";

import { ROUTES } from "./paths";

// user persist 와 토큰 저장소가 별도로 관리되므로 둘 다 살아있어야 인증된 것으로 본다.
// 토큰이 없는데 user 만 살아있는 케이스는 PrivateRoute 단계에서 차단해 무한 풀 리로드 점멸을 막는다.
function isAuthenticated(user: ReturnType<typeof useAuthStore.getState>["user"]): boolean {
  return !!user && !!getAccessToken();
}

export function PrivateRoute({ children }: PropsWithChildren) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!isAuthenticated(user)) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

export function AdminRoute({ children }: PropsWithChildren) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!isAuthenticated(user)) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  }
  if (user!.role !== "ADMIN") {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: PropsWithChildren) {
  const user = useAuthStore((s) => s.user);
  if (isAuthenticated(user)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return <>{children}</>;
}
