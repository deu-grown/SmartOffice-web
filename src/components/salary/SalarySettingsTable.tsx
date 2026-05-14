// 급여 기준 표 — features/salary 흡수 (묶음 3 커밋 3.2 mock 제거).
// CRU 만 지원 — DELETE 백엔드 미지원, UI 미노출 (마스터플랜 G6 setting 도메인 명시).
import { useState } from "react";
import { Plus, Briefcase, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useCreateSalarySetting,
  useSalarySettings,
  useUpdateSalarySetting,
} from "@/src/features/salary/hooks";
import type { SalarySetting } from "@/src/features/salary/types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount);
}

function toNumber(v: string | number): number {
  return typeof v === "string" ? Number(v) : v;
}

export function SalarySettingsTable() {
  const settingsQuery = useSalarySettings();
  const createMutation = useCreateSalarySetting();
  const updateMutation = useUpdateSalarySetting();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPosition, setNewPosition] = useState("");
  const [newBase, setNewBase] = useState("");
  const [newOvertimeRate, setNewOvertimeRate] = useState("1.5");
  const [newNightRate, setNewNightRate] = useState("2.0");
  const [newEffectiveFrom, setNewEffectiveFrom] = useState(new Date().toISOString().slice(0, 10));

  const [editTarget, setEditTarget] = useState<SalarySetting | null>(null);
  const [editBase, setEditBase] = useState("");
  const [editOvertimeRate, setEditOvertimeRate] = useState("");
  const [editNightRate, setEditNightRate] = useState("");

  const handleCreate = () => {
    if (!newPosition.trim() || !newBase.trim()) {
      toast.error("직급·기본급은 필수입니다.");
      return;
    }
    createMutation.mutate(
      {
        position: newPosition.trim(),
        baseSalary: Number(newBase),
        overtimeRate: Number(newOvertimeRate),
        nightRate: Number(newNightRate),
        effectiveFrom: newEffectiveFrom,
      },
      {
        onSuccess: () => {
          toast.success("급여 기준이 등록되었습니다.");
          setIsAddOpen(false);
          setNewPosition("");
          setNewBase("");
        },
        onError: (err: Error) => toast.error(err.message || "급여 기준 등록에 실패했습니다."),
      }
    );
  };

  const openEdit = (s: SalarySetting) => {
    setEditTarget(s);
    setEditBase(String(s.baseSalary));
    setEditOvertimeRate(String(toNumber(s.overtimeRate)));
    setEditNightRate(String(toNumber(s.nightRate)));
  };

  const handleUpdate = () => {
    if (!editTarget) return;
    updateMutation.mutate(
      {
        id: editTarget.id,
        body: {
          baseSalary: editBase ? Number(editBase) : undefined,
          overtimeRate: editOvertimeRate ? Number(editOvertimeRate) : undefined,
          nightRate: editNightRate ? Number(editNightRate) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("급여 기준이 수정되었습니다.");
          setEditTarget(null);
        },
        onError: (err: Error) => toast.error(err.message || "급여 기준 수정에 실패했습니다."),
      }
    );
  };

  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
      {/* 등록 모달 */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">급여 기준 등록</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">직급</label>
                <Input value={newPosition} onChange={(e) => setNewPosition(e.target.value)} className="h-12 rounded-2xl" placeholder="예: 사원 / 대리 / 팀장" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">기본급 (원)</label>
                <Input type="number" value={newBase} onChange={(e) => setNewBase(e.target.value)} className="h-12 rounded-2xl font-mono" placeholder="2500000" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 ml-1">초과 배율</label>
                  <Input type="number" step="0.1" value={newOvertimeRate} onChange={(e) => setNewOvertimeRate(e.target.value)} className="h-12 rounded-2xl font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 ml-1">야간 배율</label>
                  <Input type="number" step="0.1" value={newNightRate} onChange={(e) => setNewNightRate(e.target.value)} className="h-12 rounded-2xl font-mono" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">적용 시작일</label>
                <Input type="date" value={newEffectiveFrom} onChange={(e) => setNewEffectiveFrom(e.target.value)} className="h-12 rounded-2xl font-mono" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setIsAddOpen(false)} disabled={createMutation.isPending} className="flex-1 h-12 rounded-2xl font-bold">
                취소
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="flex-1 h-12 rounded-2xl font-bold bg-black text-white hover:bg-black/90">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "등록"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 수정 모달 */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900">급여 기준 수정</h2>
              <p className="text-sm text-gray-400 mt-1">{editTarget.position} (#{editTarget.id})</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">기본급 (원)</label>
                <Input type="number" value={editBase} onChange={(e) => setEditBase(e.target.value)} className="h-12 rounded-2xl font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 ml-1">초과 배율</label>
                  <Input type="number" step="0.1" value={editOvertimeRate} onChange={(e) => setEditOvertimeRate(e.target.value)} className="h-12 rounded-2xl font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 ml-1">야간 배율</label>
                  <Input type="number" step="0.1" value={editNightRate} onChange={(e) => setEditNightRate(e.target.value)} className="h-12 rounded-2xl font-mono" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setEditTarget(null)} disabled={updateMutation.isPending} className="flex-1 h-12 rounded-2xl font-bold">
                취소
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="flex-1 h-12 rounded-2xl font-bold bg-black text-white hover:bg-black/90">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "저장"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-gray-400" />
          직급별 급여 기준 ({settingsQuery.data?.length ?? 0})
        </h3>
        <Button onClick={() => setIsAddOpen(true)} className="bg-black text-white hover:bg-black/90 rounded-xl h-10 px-4 font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          기준 추가
        </Button>
      </div>

      {settingsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : settingsQuery.isError ? (
        <p className="text-red-500 text-sm font-medium">급여 기준을 불러오지 못했습니다.</p>
      ) : (settingsQuery.data ?? []).length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">등록된 급여 기준이 없습니다.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pb-4">직급</TableHead>
              <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pb-4">기본급</TableHead>
              <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pb-4">초과배율</TableHead>
              <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pb-4">야간배율</TableHead>
              <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pb-4">적용기간</TableHead>
              <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pb-4">상태</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(settingsQuery.data ?? []).map((s) => (
              <TableRow key={s.id} className="border-none hover:bg-gray-50 transition-colors">
                <TableCell className="py-4 font-bold">{s.position}</TableCell>
                <TableCell className="py-4 font-mono">₩{formatCurrency(s.baseSalary)}</TableCell>
                <TableCell className="py-4 font-mono text-sm">{toNumber(s.overtimeRate).toFixed(1)}×</TableCell>
                <TableCell className="py-4 font-mono text-sm">{toNumber(s.nightRate).toFixed(1)}×</TableCell>
                <TableCell className="py-4 font-mono text-xs text-gray-500">
                  {s.effectiveFrom} ~ {s.effectiveTo ?? "현재"}
                </TableCell>
                <TableCell className="py-4">
                  <Badge className={cn_local(s.effectiveTo === null)}>{s.effectiveTo === null ? "ACTIVE" : "EXPIRED"}</Badge>
                </TableCell>
                <TableCell className="py-4">
                  <button onClick={() => openEdit(s)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-colors" aria-label="수정">
                    <Pencil className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function cn_local(active: boolean): string {
  return `rounded-full font-bold px-3 py-1 border-none ${active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`;
}
