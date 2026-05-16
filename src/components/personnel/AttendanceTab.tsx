import React, { useState } from "react";
import { AlertTriangle, Calendar, Edit2, Play } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import {
  useAttendanceDaily,
  useCorrectAttendance,
  useTriggerAttendanceBatch,
} from "@/src/features/attendance/hooks";
import type {
  AttendanceCorrectRequest,
  AttendanceDaily,
} from "@/src/features/attendance/types";

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PRESENT: { label: "정상", className: "bg-success-bg text-success-fg" },
  LATE: { label: "지각", className: "bg-warning-bg text-warning-fg" },
  EARLY_LEAVE: { label: "조퇴", className: "bg-warning-bg text-warning-fg" },
  ABSENT: { label: "결근", className: "bg-error-bg text-error-fg" },
};

// ADMIN 근태 관리 탭 — 임의 날짜 일별 목록 + 수동 보정 + 배치 트리거(위험 액션).
export function AttendanceTab() {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [nameFilter, setNameFilter] = useState("");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<AttendanceDaily | null>(null);

  const query = useAttendanceDaily({
    date,
    name: nameFilter || undefined,
    page,
    size: PAGE_SIZE,
  });
  const correctMutation = useCorrectAttendance();

  const rows = query.data?.content ?? [];

  const handleCorrectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const form = new FormData(e.currentTarget);
    const body: AttendanceCorrectRequest = {
      checkIn: (form.get("checkIn") as string) || undefined,
      checkOut: (form.get("checkOut") as string) || undefined,
      note: (form.get("note") as string) || undefined,
    };
    correctMutation.mutate(
      { id: editing.attendanceId, body },
      {
        onSuccess: () => {
          toast.success("근태 정보가 수정되었습니다.");
          setEditing(null);
        },
        onError: (err) => toast.error(err?.message ?? "근태 수정에 실패했습니다."),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(0);
              }}
              className="pl-10 h-12 w-44 bg-surface-2 border-border rounded-2xl shadow-sm"
            />
          </div>
          <Input
            placeholder="이름 검색"
            value={nameFilter}
            onChange={(e) => {
              setNameFilter(e.target.value);
              setPage(0);
            }}
            className="h-12 w-60 bg-surface-2 border-border rounded-2xl shadow-sm"
          />
        </div>
        <AttendanceBatchTriggerButton />
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-2 text-muted-foreground text-[11.5px] font-semibold uppercase tracking-[0.07em]">
                <th className="px-[18px] py-[14px] whitespace-nowrap">직원</th>
                <th className="px-[18px] py-[14px] whitespace-nowrap">출근</th>
                <th className="px-[18px] py-[14px] whitespace-nowrap">퇴근</th>
                <th className="px-[18px] py-[14px] whitespace-nowrap">근무 / 야근</th>
                <th className="px-[18px] py-[14px] whitespace-nowrap">상태</th>
                <th className="px-[18px] py-[14px] whitespace-nowrap">비고</th>
                <th className="px-[18px] py-[14px] whitespace-nowrap text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-[18px] py-[14px]">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : query.isError ? (
                <tr>
                  <td colSpan={7} className="px-[18px] py-12 text-center text-sm font-bold text-error-fg">
                    근태 목록을 불러오지 못했습니다: {query.error?.message ?? ""}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-[18px] py-12 text-center text-muted-foreground">
                    해당 날짜의 근태 기록이 없습니다.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const statusMeta = STATUS_LABEL[r.attendanceStatus] ?? {
                    label: r.attendanceStatus,
                    className: "bg-surface-2 text-muted-foreground",
                  };
                  return (
                    <tr key={r.attendanceId} className="hover:bg-surface-2 group">
                      <td className="px-[18px] py-[14px]">
                        <span className="font-bold text-foreground">{r.userName}</span>
                        <span className="block text-[10px] text-muted-foreground">ID: {r.userId}</span>
                      </td>
                      <td className="px-[18px] py-[14px] text-sm text-foreground">
                        {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
                      </td>
                      <td className="px-[18px] py-[14px] text-sm text-foreground">
                        {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
                      </td>
                      <td className="px-[18px] py-[14px] text-sm text-foreground">
                        {r.workMinutes !== null ? `${Math.floor(r.workMinutes / 60)}h ${r.workMinutes % 60}m` : "-"}
                        {r.overtimeMinutes ? (
                          <span className="text-muted-foreground text-[10px] ml-1">(+{r.overtimeMinutes}m)</span>
                        ) : null}
                      </td>
                      <td className="px-[18px] py-[14px]">
                        <Badge className={cn("border-none px-3 py-1 rounded-full text-[10px] font-bold shrink-0", statusMeta.className)}>
                          {statusMeta.label}
                        </Badge>
                      </td>
                      <td className="px-[18px] py-[14px] text-xs text-muted-foreground">{r.attendanceNote ?? "-"}</td>
                      <td className="px-[18px] py-[14px] text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2 opacity-0 group-hover:opacity-100 transition"
                          onClick={() => setEditing(r)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="bg-surface border-border text-foreground max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">근태 수동 보정</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editing ? `${editing.userName} · ${editing.workDate}` : ""} 의 출/퇴근 시각을 보정합니다.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <form onSubmit={handleCorrectSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correct-in">출근</Label>
                  <Input
                    id="correct-in"
                    name="checkIn"
                    type="datetime-local"
                    defaultValue={editing.checkIn?.slice(0, 16) ?? ""}
                    className="bg-surface-2 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correct-out">퇴근</Label>
                  <Input
                    id="correct-out"
                    name="checkOut"
                    type="datetime-local"
                    defaultValue={editing.checkOut?.slice(0, 16) ?? ""}
                    className="bg-surface-2 border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="correct-note">변경 사유 (권장)</Label>
                <Input
                  id="correct-note"
                  name="note"
                  defaultValue={editing.attendanceNote ?? ""}
                  placeholder="임의 보정 추적용 (예: 출입게이트 오류로 누락된 퇴근 시각 보정)"
                  className="bg-surface-2 border-border"
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setEditing(null)} className="text-muted-foreground">
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={correctMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {correctMutation.isPending ? "수정 중..." : "수정 완료"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── 위험 액션: 월간 근태 일괄 산출 수동 트리거 ────────────────────────
// 마스터플랜 G7 power/billing/calculate 와 동일 UX 패턴.
// ① 멱등성 라벨 ② 확인 모달(대상 날짜 입력) ③ 결과 모달(처리 건수) ④ 실패/중복 시 토스트 + 모달 유지.
function AttendanceBatchTriggerButton() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [processed, setProcessed] = useState<number | null>(null);
  const [targetDate, setTargetDate] = useState<string>(() =>
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );
  const [confirmText, setConfirmText] = useState("");
  const batchMutation = useTriggerAttendanceBatch();

  const handleTrigger = () => {
    batchMutation.mutate(
      { targetDate },
      {
        onSuccess: (count) => {
          setProcessed(count);
          setConfirmOpen(false);
          setResultOpen(true);
        },
        onError: (err) => {
          toast.error(err?.message ?? "배치 실행에 실패했습니다.");
          // 모달 유지 (재시도 가능).
        },
      },
    );
  };

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <Button
          onClick={() => setConfirmOpen(true)}
          className="bg-error text-white hover:bg-error/90 rounded-2xl h-12 px-6 font-bold flex items-center gap-2 shadow-md"
        >
          <Play className="w-4 h-4" />
          월간 배치 트리거
        </Button>
        <span className="text-[10px] text-error-fg font-medium flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          기존 배치 결과를 덮어씁니다 (멱등 X)
        </span>
      </div>

      <Dialog open={confirmOpen} onOpenChange={(open) => !open && setConfirmOpen(false)}>
        <DialogContent className="bg-surface border-border text-foreground max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-error-fg">
              <AlertTriangle className="w-6 h-6" /> 배치 실행 확인
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              해당 날짜의 근태 집계를 다시 산출합니다.
              <span className="block mt-1 text-error-fg font-bold">기존 결과가 있다면 덮어쓰여집니다.</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="batch-date">대상 날짜</Label>
              <Input
                id="batch-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-surface-2 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-confirm">실행하려면 아래에 `RUN` 을 입력하세요</Label>
              <Input
                id="batch-confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="bg-surface-2 border-border"
                placeholder="RUN"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)} className="text-muted-foreground">
              취소
            </Button>
            <Button
              type="button"
              onClick={handleTrigger}
              disabled={batchMutation.isPending || confirmText !== "RUN" || !targetDate}
              className="bg-error text-white hover:bg-error/90 disabled:opacity-50"
            >
              {batchMutation.isPending ? "실행 중..." : "실행"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resultOpen} onOpenChange={(open) => !open && setResultOpen(false)}>
        <DialogContent className="bg-surface border-border text-foreground max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">배치 실행 결과</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {targetDate} 의 근태 집계가 완료되었습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-muted-foreground text-sm mb-2">처리 건수</p>
            <p className="text-4xl font-bold text-foreground tabular-nums">{processed ?? 0}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setResultOpen(false)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
