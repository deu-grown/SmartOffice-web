import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "motion/react";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("hgd123@gmail.com");
  const [password, setPassword] = useState("password123");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      toast.success("로그인에 성공했습니다.", {
        description: "환영합니다, 홍길동님!",
      });
      onLogin();
    } else {
      toast.error("이메일과 비밀번호를 입력해주세요.");
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
              className="w-full h-15 bg-black text-white hover:bg-black/90 rounded-2xl text-lg font-bold shadow-xl shadow-black/10 transition-all active:scale-[0.98] mt-4"
            >
              로그인하기
            </Button>
          </form>

          <footer className="pt-4 text-center">
            <p className="text-gray-400 font-medium">
              아직 계정이 없으신가요?{" "}
              <button className="text-black font-bold hover:underline ml-1 transition-all">
                회원가입하기
              </button>
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}
