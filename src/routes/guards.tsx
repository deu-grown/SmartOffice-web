// 라우트 가드 컴포넌트.
// PrivateRoute : 인증 필요. 미인증 시 로그인으로 리다이렉트.
// AdminRoute   : ADMIN 역할만 허용. 비-ADMIN 은 대시보드로.
// PublicOnlyRoute : 이미 인증된 사용자가 /login 등에 접근하면 대시보드로.
import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "@/src/stores/authStore";

import { ROUTES } from "./paths";

export function PrivateRoute({ children }: PropsWithChildren) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

export function AdminRoute({ children }: PropsWithChildren) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  }
  if (user.role !== "ADMIN") {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: PropsWithChildren) {
  const user = useAuthStore((s) => s.user);
  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return <>{children}</>;
}
