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
  PRESENT: { label: "정상", className: "bg-green-500/10 text-green-600" },
  LATE: { label: "지각", className: "bg-orange-500/10 text-orange-600" },
  EARLY_LEAVE: { label: "조퇴", className: "bg-yellow-500/10 text-yellow-600" },
  ABSENT: { label: "결근", className: "bg-red-500/10 text-red-600" },
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
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(0);
              }}
              className="pl-10 h-12 w-44 bg-white border-gray-100 rounded-2xl shadow-sm"
            />
          </div>
          <Input
            placeholder="이름 검색"
            value={nameFilter}
            onChange={(e) => {
              setNameFilter(e.target.value);
              setPage(0);
            }}
            className="h-12 w-60 bg-white border-gray-100 rounded-2xl shadow-sm"
          />
        </div>
        <AttendanceBatchTriggerButton />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-5">직원</th>
                <th className="px-6 py-5">출근</th>
                <th className="px-6 py-5">퇴근</th>
                <th className="px-6 py-5">근무 / 야근</th>
                <th className="px-6 py-5">상태</th>
                <th className="px-6 py-5">비고</th>
                <th className="px-6 py-5 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {query.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
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
                    근태 목록을 불러오지 못했습니다: {query.error?.message ?? ""}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    해당 날짜의 근태 기록이 없습니다.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const statusMeta = STATUS_LABEL[r.attendanceStatus] ?? {
                    label: r.attendanceStatus,
                    className: "bg-gray-100 text-gray-600",
                  };
                  return (
                    <tr key={r.attendanceId} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-black">{r.userName}</span>
                        <span className="block text-[10px] text-gray-400">ID: {r.userId}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {r.workMinutes !== null ? `${Math.floor(r.workMinutes / 60)}h ${r.workMinutes % 60}m` : "-"}
                        {r.overtimeMinutes ? (
                          <span className="text-gray-400 text-[10px] ml-1">(+{r.overtimeMinutes}m)</span>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={cn("border-none px-3 py-1 rounded-full text-[10px] font-bold", statusMeta.className)}>
                          {statusMeta.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">{r.attendanceNote ?? "-"}</td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition"
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
        <DialogContent className="bg-white border-gray-100 text-black max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">근태 수동 보정</DialogTitle>
            <DialogDescription className="text-gray-400">
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
                    className="bg-gray-50 border-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correct-out">퇴근</Label>
                  <Input
                    id="correct-out"
                    name="checkOut"
                    type="datetime-local"
                    defaultValue={editing.checkOut?.slice(0, 16) ?? ""}
                    className="bg-gray-50 border-gray-100"
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
                  className="bg-gray-50 border-gray-100"
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setEditing(null)} className="text-gray-400">
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={correctMutation.isPending}
                  className="bg-black text-white hover:bg-black/90"
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
          className="bg-red-500 text-white hover:bg-red-600 rounded-2xl h-12 px-6 font-bold flex items-center gap-2 shadow-md"
        >
          <Play className="w-4 h-4" />
          월간 배치 트리거
        </Button>
        <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          기존 배치 결과를 덮어씁니다 (멱등 X)
        </span>
      </div>

      <Dialog open={confirmOpen} onOpenChange={(open) => !open && setConfirmOpen(false)}>
        <DialogContent className="bg-white border-gray-100 text-black max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" /> 배치 실행 확인
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              해당 날짜의 근태 집계를 다시 산출합니다.
              <span className="block mt-1 text-red-500 font-bold">기존 결과가 있다면 덮어쓰여집니다.</span>
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
                className="bg-gray-50 border-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-confirm">실행하려면 아래에 `RUN` 을 입력하세요</Label>
              <Input
                id="batch-confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="bg-gray-50 border-gray-100"
                placeholder="RUN"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)} className="text-gray-400">
              취소
            </Button>
            <Button
              type="button"
              onClick={handleTrigger}
              disabled={batchMutation.isPending || confirmText !== "RUN" || !targetDate}
              className="bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300"
            >
              {batchMutation.isPending ? "실행 중..." : "실행"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resultOpen} onOpenChange={(open) => !open && setResultOpen(false)}>
        <DialogContent className="bg-white border-gray-100 text-black max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">배치 실행 결과</DialogTitle>
            <DialogDescription className="text-gray-500">
              {targetDate} 의 근태 집계가 완료되었습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-gray-400 text-sm mb-2">처리 건수</p>
            <p className="text-4xl font-bold text-black">{processed ?? 0}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setResultOpen(false)} className="bg-black text-white hover:bg-black/90">
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
