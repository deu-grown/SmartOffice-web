import { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Users,
  DoorOpen,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useAccessLogs } from "@/src/features/accesslog/hooks";

const PAGE_SIZE = 20;

const AUTH_RESULT_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "APPROVED", label: "정상 승인" },
  { value: "DENIED", label: "인가 실패" },
  { value: "BLOCKED", label: "차단" },
  // V5 시드 잔존 호환 — BACKEND_SUGGESTIONS 등록 예정.
  { value: "ALLOW", label: "정상(시드)" },
];

const DIRECTION_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "IN", label: "입장" },
  { value: "OUT", label: "퇴장" },
];

const AUTH_LABEL: Record<string, { label: string; className: string }> = {
  APPROVED: { label: "정상", className: "bg-green-500/10 text-green-600" },
  ALLOW: { label: "정상", className: "bg-green-500/10 text-green-600" },
  DENIED: { label: "인가 실패", className: "bg-red-500/10 text-red-600" },
  BLOCKED: { label: "차단", className: "bg-orange-500/10 text-orange-600" },
};

export function AccessRecordTable() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [authResult, setAuthResult] = useState("all");
  const [direction, setDirection] = useState("all");
  const [userIdInput, setUserIdInput] = useState("");
  const [page, setPage] = useState(0);

  const userIdNum = Number(userIdInput);
  const filter = {
    userId: userIdInput && Number.isFinite(userIdNum) && userIdNum > 0 ? userIdNum : undefined,
    authResult: authResult !== "all" ? authResult : undefined,
    direction: direction !== "all" ? direction : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    size: PAGE_SIZE,
  };

  const query = useAccessLogs(filter);
  const data = query.data;
  const rows = data?.logs ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = Math.max(data?.totalPages ?? 1, 1);

  // 페이지 단위 통계 — 전체 통계는 백엔드 별도 집계 API 부재. 현재 페이지 기준 표시.
  const deniedCount = rows.filter((r) => r.authResult === "DENIED" || r.authResult === "BLOCKED").length;
  const inCount = rows.filter((r) => r.direction === "IN").length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RecordStatCard
          icon={Users}
          label="조건 일치 전체 건수"
          value={totalElements.toLocaleString()}
          unit="건"
        />
        <RecordStatCard
          icon={DoorOpen}
          label="현재 페이지 입장 수"
          value={inCount.toString()}
          unit="건"
          color="text-blue-500"
        />
        <RecordStatCard
          icon={AlertCircle}
          label="현재 페이지 비정상"
          value={deniedCount.toString()}
          unit="건"
          color="text-red-500"
        />
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FilterField label="시작일">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(0);
              }}
              className="bg-gray-50 border-gray-100 rounded-xl h-12"
            />
          </FilterField>
          <FilterField label="종료일">
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(0);
              }}
              className="bg-gray-50 border-gray-100 rounded-xl h-12"
            />
          </FilterField>
          <FilterField label="인증 결과">
            <Select
              value={authResult}
              onValueChange={(v) => {
                setAuthResult(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="bg-gray-50 border-gray-100 rounded-xl h-12">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100">
                {AUTH_RESULT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="방향">
            <Select
              value={direction}
              onValueChange={(v) => {
                setDirection(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="bg-gray-50 border-gray-100 rounded-xl h-12">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100">
                {DIRECTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="userId 직접 입력 (정수)"
              value={userIdInput}
              onChange={(e) => {
                setUserIdInput(e.target.value);
                setPage(0);
              }}
              className="pl-12 h-12 bg-gray-50 border-gray-100 rounded-2xl"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-5">시각</th>
                <th className="px-6 py-5">직원</th>
                <th className="px-6 py-5">구역</th>
                <th className="px-6 py-5">장치</th>
                <th className="px-6 py-5">방향</th>
                <th className="px-6 py-5">결과</th>
                <th className="px-6 py-5">사유</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {query.isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : query.isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm font-bold text-red-500">
                    출입 로그를 불러오지 못했습니다: {query.error?.message ?? ""}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    조건에 맞는 출입 기록이 없습니다.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const meta = AUTH_LABEL[r.authResult] ?? {
                    label: r.authResult,
                    className: "bg-gray-100 text-gray-600",
                  };
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-xs text-gray-700 font-medium">
                        {new Date(r.taggedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-black">{r.userName ?? "(미식별)"}</span>
                          <span className="text-[10px] text-gray-400">
                            {r.employeeNumber ?? r.uid ?? "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{r.zoneName}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{r.deviceName}</td>
                      <td className="px-6 py-4 text-xs">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full font-bold",
                            r.direction === "IN"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-orange-100 text-orange-600",
                          )}
                        >
                          {r.direction === "IN" ? "입장" : "퇴장"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={cn(
                            "border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            meta.className,
                          )}
                        >
                          {meta.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">{r.denyReason ?? "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-sm text-gray-500">
            전체 <span className="font-bold text-black">{totalElements}</span>건 · 페이지 {page + 1}/
            {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(Math.max(page - 1, 0))}
              disabled={page === 0}
              className="w-10 h-10 rounded-xl border-gray-100 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(Math.min(page + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
              className="w-10 h-10 rounded-xl border-gray-100 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-400 ml-1">{label}</label>
      {children}
    </div>
  );
}

function RecordStatCard({
  icon: Icon,
  label,
  value,
  unit,
  color = "text-black",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  color?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center">
          <Icon className={cn("w-5 h-5", color)} />
        </div>
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-sm font-medium text-gray-400">{unit}</span>
      </div>
    </div>
  );
}
