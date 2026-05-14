// 라우트 가드 컴포넌트.
// PrivateRoute : 인증 필요. 미인증 시 로그인으로 리다이렉트.
// AdminRoute   : ADMIN 역할만 허용. 비-ADMIN 토큰은 즉시 로그아웃 후 /login 으로.
// PublicOnlyRoute : 이미 인증된 사용자가 /login 등에 접근하면 대시보드로.
import { useEffect, type PropsWithChildren } from "react";
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
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const isAuthed = isAuthenticated(user);
  const isAdmin = isAuthed && user!.role === "ADMIN";

  // 인증 토큰은 있으나 ADMIN 이 아니면 정책상(웹은 관리자 전용) 세션을 정리한다.
  // 정리는 부수효과이므로 렌더 사이클이 아닌 effect 에서 수행. 동기 Navigate 는 그대로 즉시 차단.
  useEffect(() => {
    if (isAuthed && !isAdmin) {
      logout();
    }
  }, [isAuthed, isAdmin, logout]);

  if (!isAuthed) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to={ROUTES.LOGIN} replace />;
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
