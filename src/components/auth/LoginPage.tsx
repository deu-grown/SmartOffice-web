import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "motion/react";
import { User, LoginResponse } from "../../types";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@grown.com");
  const [password, setPassword] = useState("EMP001");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Try proxy first (current setup)
      const response = await fetch("/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type");
      let result: LoginResponse;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON Response Payload:", text);
        
        let errorMessage = "서버로부터 예상치 못한 응답을 받았습니다.";
        let description = "JSON 형식이 아닌 데이터가 반환되었습니다.";

        if (text.includes("403 Forbidden")) {
          errorMessage = "접근 권한 없음 (403)";
          description = "API 서버 주소가 정확한지, 혹은 서버에서 접근을 차단했는지 확인이 필요합니다.";
        } else if (response.status === 404) {
          errorMessage = "페이지를 찾을 수 없음 (404)";
          description = "요청하신 로그인 경로가 서버에 존재하지 않습니다.";
        } else if (response.status >= 500) {
          errorMessage = "서버 내부 오류 (500)";
          description = "서버 측에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }

        toast.error(errorMessage, { description });
        return;
      }

      if (response.ok && result.code === "success") {
        const { accessToken, user } = result.data;
        
        // Store tokens for persistence
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", result.data.refreshToken);
        
        toast.success(result.message || "로그인에 성공했습니다.", {
          description: `환영합니다, ${user.name}님!`,
        });
        
        onLogin(user);
      } else {
        if (result.code === "ACCOUNT_INACTIVE") {
          toast.error("계정 비활성화", {
            description: result.message || "현재 휴면 상태인 계정입니다. 관리자에게 문의하세요."
          });
        } else {
          toast.error(result.message || "로그인에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("로그인 중 오류가 발생했습니다. 서버 연결을 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f9fa] p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[540px] bg-white rounded-[40px] shadow-sm border border-gray-100 p-12 md:p-16"
      >
        <div className="space-y-10">
          <header className="space-y-3">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900">로그인</h1>
            <p className="text-gray-500 text-lg font-medium">서비스를 이용하려면 계정에 로그인하세요</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-sm font-bold text-gray-900 ml-1">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="h-14 rounded-2xl bg-gray-50 border-gray-100 focus-visible:ring-black/5 focus-visible:border-black transition-all pl-5 text-black"
                  required
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-sm font-bold text-gray-900 ml-1">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="h-14 rounded-2xl bg-gray-50 border-gray-100 focus-visible:ring-black/5 focus-visible:border-black transition-all pl-5 pr-14 text-black"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
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
                  className="w-5 h-5 rounded-lg border-gray-200 data-[state=checked]:bg-black data-[state=checked]:border-black transition-all" 
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-bold text-gray-500 cursor-pointer select-none"
                >
                  로그인 상태 유지
                </label>
              </div>
              <button type="button" className="text-sm font-bold text-gray-400 hover:text-black transition-colors">
                비밀번호 찾기
              </button>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-15 bg-black text-white hover:bg-black/90 rounded-2xl text-lg font-bold shadow-xl shadow-black/10 transition-all active:scale-[0.98] mt-4"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  로그인 중...
                </div>
              ) : "로그인하기"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
