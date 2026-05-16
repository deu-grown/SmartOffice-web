// 급여 내역 표 — features/salary 흡수 (묶음 3 커밋 3.2 mock 제거).
// 좌측: 검색 + 표(useSalaryRecords). 우측: 명세서 카드 + DRAFT → CONFIRMED 확정 액션.
import { useState } from "react";
import { Search, DollarSign, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { useConfirmSalaryRecord, useSalaryRecords } from "@/src/features/salary/hooks";
import type { SalaryRecord } from "@/src/features/salary/types";

interface SalaryRecordsTableProps {
  year: number;
  month: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount);
}

export function SalaryRecordsTable({ year, month }: SalaryRecordsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(null);

  const recordsQuery = useSalaryRecords({ year, month, size: 50 });
  const confirmMutation = useConfirmSalaryRecord();

  const records = recordsQuery.data?.content ?? [];
  const filtered = records.filter(
    (r) =>
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) || String(r.userId).includes(searchTerm)
  );

  const handleConfirm = (record: SalaryRecord) => {
    if (record.status === "CONFIRMED") {
      toast.info("이미 확정된 급여입니다.");
      return;
    }
    if (!window.confirm(`'${record.userName}'(${year}.${month}) 급여를 확정하시겠습니까?\n확정 후에는 재계산 대상에서 제외됩니다.`)) return;
    confirmMutation.mutate(record.id, {
      onSuccess: (updated) => {
        toast.success(`${record.userName} 급여가 확정되었습니다.`);
        setSelectedRecord(updated);
      },
      onError: (err: Error) => toast.error(err.message || "급여 확정에 실패했습니다."),
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-6">
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-[var(--shadow-card)] flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="이름 또는 사번으로 검색..."
              className="pl-12 bg-transparent border-none focus-visible:ring-0 text-lg h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="h-8 w-[1px] bg-border mx-2" />
          <div className="flex items-center gap-2 px-2">
            <span className="text-sm font-medium text-muted-foreground">
              {year}.{String(month).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border shadow-[var(--shadow-card)] overflow-hidden p-4">
          {recordsQuery.isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recordsQuery.isError ? (
            <div className="p-8 text-center text-error-fg text-sm font-medium">급여 내역을 불러오지 못했습니다.</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              {year}년 {month}월 급여 내역이 없습니다. 산출 버튼으로 먼저 산출해 주세요.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-semibold text-muted-foreground uppercase tracking-[0.07em] text-[11.5px] pb-4">이름</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase tracking-[0.07em] text-[11.5px] pb-4">사번</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase tracking-[0.07em] text-[11.5px] pb-4">기본급</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase tracking-[0.07em] text-[11.5px] pb-4">초과수당</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase tracking-[0.07em] text-[11.5px] pb-4">실지급액</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase tracking-[0.07em] text-[11.5px] pb-4">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((record) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedRecord(record)}
                      className={cn(
                        "group cursor-pointer border-none transition-all duration-200",
                        selectedRecord?.id === record.id ? "bg-surface-2/50" : "hover:bg-surface-2"
                      )}
                    >
                      <TableCell className="py-5 font-bold">{record.userName}</TableCell>
                      <TableCell className="py-5 text-muted-foreground font-medium font-mono text-sm">#{record.userId}</TableCell>
                      <TableCell className="py-5 font-mono text-sm">₩{formatCurrency(record.baseSalary)}</TableCell>
                      <TableCell className="py-5 font-mono text-sm">₩{formatCurrency(record.overtimePay)}</TableCell>
                      <TableCell className="py-5">
                        <span className="font-bold text-foreground font-mono">₩{formatCurrency(record.totalPay)}</span>
                      </TableCell>
                      <TableCell className="py-5">
                        <Badge className={cn("rounded-full font-bold px-3 py-1 border-none", record.status === "CONFIRMED" ? "bg-success-bg text-success-fg" : "bg-surface-2 text-muted-foreground")}>
                          {record.status}
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <div className="w-full lg:w-96 shrink-0">
        <AnimatePresence mode="wait">
          {selectedRecord ? (
            <motion.div
              key={selectedRecord.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-[oklch(0.555_0.180_258/0.06)] rounded-2xl p-8 h-full min-h-[600px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-foreground">
                  {selectedRecord.year}년 {selectedRecord.month}월 급여 명세서
                </h3>
                <Badge className={cn("rounded-full font-bold px-3 py-1 border-none", selectedRecord.status === "CONFIRMED" ? "bg-success-bg text-success-fg" : "bg-surface text-muted-foreground")}>
                  {selectedRecord.status}
                </Badge>
              </div>

              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <span className="text-muted-foreground font-medium">성함</span>
                  <span className="text-right font-bold">{selectedRecord.userName}</span>
                  <span className="text-muted-foreground font-medium">사번</span>
                  <span className="text-right font-bold font-mono">#{selectedRecord.userId}</span>
                </div>

                <div className="h-[1px] bg-border" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm font-medium">기본급</span>
                    <span className="font-mono font-bold text-lg">₩{formatCurrency(selectedRecord.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm font-medium">초과수당</span>
                    <span className="font-mono font-bold text-lg">₩{formatCurrency(selectedRecord.overtimePay)}</span>
                  </div>
                </div>

                <div className="h-[1px] bg-border" />

                <div className="bg-surface p-6 rounded-2xl space-y-2">
                  <span className="text-muted-foreground text-[11.5px] font-semibold uppercase tracking-[0.06em]">총 지급액</span>
                  <div className="flex justify-between items-end">
                    <span className="text-3xl font-black font-mono">₩{formatCurrency(selectedRecord.totalPay)}</span>
                    <span className="text-[10px] text-muted-foreground font-medium mb-1">KRW</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleConfirm(selectedRecord)}
                  disabled={selectedRecord.status === "CONFIRMED" || confirmMutation.isPending}
                  className={cn(
                    "w-full h-12 rounded-2xl font-bold gap-2",
                    selectedRecord.status === "CONFIRMED"
                      ? "bg-surface-2 text-muted-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {confirmMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> 처리 중...
                    </>
                  ) : selectedRecord.status === "CONFIRMED" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> 이미 확정됨
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> 급여 확정
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-surface-2 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center p-8 text-center h-full min-h-[600px]">
              <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-6">
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">직원을 선택해 주세요</h3>
              <p className="text-muted-foreground text-sm max-w-[200px]">직원을 선택하면 상세한 급여 명세서를 조회할 수 있습니다.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
