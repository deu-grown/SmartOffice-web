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
];

const DIRECTION_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "IN", label: "입장" },
  { value: "OUT", label: "퇴장" },
];

const AUTH_LABEL: Record<string, { label: string; className: string }> = {
  APPROVED: { label: "정상", className: "bg-success-bg text-success-fg" },
  ALLOW: { label: "정상", className: "bg-success-bg text-success-fg" },
  DENIED: { label: "인가 실패", className: "bg-error-bg text-error-fg" },
  BLOCKED: { label: "차단", className: "bg-warning-bg text-warning-fg" },
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
          color="text-info-fg"
        />
        <RecordStatCard
          icon={AlertCircle}
          label="현재 페이지 비정상"
          value={deniedCount.toString()}
          unit="건"
          color="text-error-fg"
        />
      </div>

      <div className="bg-surface p-6 rounded-4xl border border-border shadow-card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FilterField label="시작일">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(0);
              }}
              className="bg-surface-2 border-border rounded-xl h-12"
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
              className="bg-surface-2 border-border rounded-xl h-12"
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
              <SelectTrigger className="bg-surface-2 border-border rounded-xl h-12">
                {/* SelectValue 가 raw value 노출하는 결함 회피 — 명시 라벨 렌더. */}
                <span>{AUTH_RESULT_OPTIONS.find((o) => o.value === authResult)?.label ?? "전체"}</span>
              </SelectTrigger>
              <SelectContent className="bg-surface border-border">
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
              <SelectTrigger className="bg-surface-2 border-border rounded-xl h-12">
                {/* SelectValue 가 raw value 노출하는 결함 회피 — 명시 라벨 렌더. */}
                <span>{DIRECTION_OPTIONS.find((o) => o.value === direction)?.label ?? "전체"}</span>
              </SelectTrigger>
              <SelectContent className="bg-surface border-border">
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="userId 직접 입력 (정수)"
              value={userIdInput}
              onChange={(e) => {
                setUserIdInput(e.target.value);
                setPage(0);
              }}
              className="pl-12 h-12 bg-surface-2 border-border rounded-2xl"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-card">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-surface-2 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-5">시각</th>
                <th className="px-6 py-5">직원</th>
                <th className="px-6 py-5">구역</th>
                <th className="px-6 py-5">장치</th>
                <th className="px-6 py-5">방향</th>
                <th className="px-6 py-5">결과</th>
                <th className="px-6 py-5">사유</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
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
                  <td colSpan={7} className="px-6 py-12 text-center text-sm font-bold text-error-fg">
                    출입 로그를 불러오지 못했습니다: {query.error?.message ?? ""}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    조건에 맞는 출입 기록이 없습니다.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const meta = AUTH_LABEL[r.authResult] ?? {
                    label: r.authResult,
                    className: "bg-surface-2 text-muted-foreground",
                  };
                  return (
                    <tr key={r.id} className="hover:bg-surface-2">
                      <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                        {new Date(r.taggedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{r.userName ?? "(미식별)"}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {r.employeeNumber ?? r.uid ?? "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{r.zoneName}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{r.deviceName}</td>
                      <td className="px-6 py-4 text-xs">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full font-bold",
                            r.direction === "IN"
                              ? "bg-info-bg text-info-fg"
                              : "bg-warning-bg text-warning-fg",
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
                      <td className="px-6 py-4 text-xs text-muted-foreground">{r.denyReason ?? "-"}</td>
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
          <p className="text-sm text-muted-foreground">
            전체 <span className="font-bold text-foreground">{totalElements}</span>건 · 페이지 {page + 1}/
            {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(Math.max(page - 1, 0))}
              disabled={page === 0}
              className="w-10 h-10 rounded-xl border-border disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(Math.min(page + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
              className="w-10 h-10 rounded-xl border-border disabled:opacity-30"
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
      <label className="text-xs font-bold text-muted-foreground ml-1">{label}</label>
      {children}
    </div>
  );
}

function RecordStatCard({
  icon: Icon,
  label,
  value,
  unit,
  color = "text-foreground",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  color?: string;
}) {
  return (
    <div className="bg-surface p-6 rounded-4xl border border-border shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 bg-surface-2 rounded-2xl flex items-center justify-center">
          <Icon className={cn("w-5 h-5", color)} />
        </div>
      </div>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <span className="text-sm font-medium text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
