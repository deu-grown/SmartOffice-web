// 시스템 설정 페이지 — userPreferences API 실 연동. ComingSoon placeholder 교체.
import { useEffect, useState } from "react";
import { Settings, Bell, Languages, Save } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useUpdateUserPreferences, useUserPreferences } from "@/src/features/userPreferences/hooks";

const LANGUAGE_OPTIONS = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
];

export function SettingsManagement() {
  const query = useUserPreferences();
  const updateMutation = useUpdateUserPreferences();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState("ko");

  // 서버 값이 로드되면 폼 초기화.
  useEffect(() => {
    if (query.data) {
      setNotificationsEnabled(query.data.notificationsEnabled);
      setLanguage(query.data.language);
    }
  }, [query.data]);

  const handleSave = () => {
    updateMutation.mutate(
      { notificationsEnabled, language },
      {
        onSuccess: () => toast.success("환경설정이 저장되었습니다."),
        onError: (err: Error) => toast.error(err.message || "저장에 실패했습니다."),
      },
    );
  };

  return (
    <div className="space-y-8 pb-20 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
          <Settings className="w-7 h-7 text-gray-700" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">시스템 설정</h1>
          <p className="text-sm font-medium text-gray-500">개인 알림 · 언어 환경을 설정합니다.</p>
        </div>
      </header>

      {query.isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-[32px]" />)}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* 알림 설정 */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">푸시 알림</p>
                <p className="text-sm text-gray-500">출입 이벤트 및 시스템 알림 수신 여부</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors duration-200",
                notificationsEnabled ? "bg-black" : "bg-gray-200",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                  notificationsEnabled ? "translate-x-8" : "translate-x-1",
                )}
              />
            </button>
          </div>

          {/* 언어 설정 */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Languages className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">언어</p>
                <p className="text-sm text-gray-500">인터페이스 표시 언어</p>
              </div>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-11 w-36 bg-gray-50 border-gray-100 rounded-2xl px-5 font-bold">
                <span>{LANGUAGE_OPTIONS.find((o) => o.value === language)?.label ?? language}</span>
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* 마지막 저장 시각 */}
          {query.data && (
            <p className="text-xs text-gray-400 text-right px-2">
              마지막 저장: {new Date(query.data.updatedAt).toLocaleString()}
            </p>
          )}

          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full h-14 rounded-2xl font-bold bg-black text-white hover:bg-black/90 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {updateMutation.isPending ? "저장 중..." : "저장하기"}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
