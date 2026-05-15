import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { useLoginMutation } from "@/src/features/auth/hooks";
import { getErrorMessage } from "@/src/lib/api/errors";
import { ApiError } from "@/src/lib/api/types";
import { ROUTES } from "@/src/routes/paths";
import { useAuthStore } from "@/src/stores/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const logout = useAuthStore((s) => s.logout);

  const [showPassword, setShowPassword] = useState(false);
  // 개발 환경(import.meta.env.DEV)에서만 admin 계정 prefill (시연·QA 편의).
  // 운영 빌드(npm run build)에서는 빈 값으로 출력 — 보안.
  const [email, setEmail] = useState(import.meta.env.DEV ? "admin@grown.com" : "");
  const [password, setPassword] = useState(import.meta.env.DEV ? "EMP001" : "");

  const isLoading = loginMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          // 웹은 관리자 전용 클라이언트(10-Capstone CLAUDE.md 3절). 비-ADMIN 토큰은 즉시 세션을 비우고 차단한다.
          if (data.user.role !== "ADMIN") {
            logout();
            toast.error(
              "이 시스템은 관리자 전용입니다. 직원용 모바일 앱(SmartOffice-app)을 이용해주세요.",
            );
            return;
          }
          toast.success("로그인에 성공했습니다.", {
            description: `환영합니다, ${data.user.name}님!`,
          });
          navigate(ROUTES.DASHBOARD, { replace: true });
        },
        onError: (error) => {
          const message =
            error instanceof ApiError
              ? getErrorMessage(error.serverMessage, "로그인에 실패했습니다.")
              : "로그인 중 오류가 발생했습니다. 서버 연결을 확인해주세요.";
          toast.error(message);
        },
      },
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-canvas p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[540px] bg-surface rounded-[40px] shadow-card border border-border p-12 md:p-16"
      >
        <div className="space-y-10">
          <header className="space-y-3">
            <p className="text-sm font-bold tracking-wider text-muted-foreground uppercase">스마트 오피스</p>
            <h1 className="text-5xl font-bold tracking-tight text-foreground">로그인</h1>
            <p className="text-muted-foreground text-lg font-medium">서비스를 이용하려면 계정에 로그인하세요</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-sm font-bold text-foreground ml-1">
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="h-14 rounded-2xl bg-surface-2 border-border focus-visible:ring-primary/20 focus-visible:border-primary transition-all pl-5 text-foreground"
                  required
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-sm font-bold text-foreground ml-1">
                  비밀번호
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="h-14 rounded-2xl bg-surface-2 border-border focus-visible:ring-primary/20 focus-visible:border-primary transition-all pl-5 pr-14 text-foreground"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="remember"
                  className="w-5 h-5 rounded-lg border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-bold text-muted-foreground cursor-pointer select-none"
                >
                  로그인 상태 유지
                </label>
              </div>
              <button
                type="button"
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                비밀번호 찾기
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-15 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl text-lg font-bold shadow-xl shadow-primary/10 transition-all active:scale-[0.98] mt-4"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  로그인 중...
                </div>
              ) : (
                "로그인하기"
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
