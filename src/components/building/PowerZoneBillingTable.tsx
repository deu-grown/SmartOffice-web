// 구역별 월 요금 내역 표 — 묶음 4 커밋 4.3.
import { Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/src/components/common/ErrorBoundary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePowerZoneBilling } from "@/src/features/power/hooks";

interface PowerZoneBillingTableProps {
  zoneId: number | undefined;
  year?: number;
  month?: number;
}

function toNumber(v: number | string): number {
  return typeof v === "string" ? Number(v) : v;
}

function formatKrw(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(n);
}

function PowerZoneBillingTableInner({ zoneId, year, month }: PowerZoneBillingTableProps) {
  const query = year !== undefined && month !== undefined ? { year, month } : undefined;
  const billing = usePowerZoneBilling(zoneId, query);

  if (zoneId === undefined) {
    return (
      <div className="bg-surface p-6 rounded-2xl border border-border shadow-[var(--shadow-card)]">
        <p className="text-sm text-muted-foreground">zone 을 선택해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-[var(--shadow-card)] space-y-4">
      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
        <Receipt className="w-5 h-5 text-muted-foreground" />
        구역 월 요금 내역 (zone #{zoneId})
      </h3>

      {billing.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : billing.isError ? (
        <p className="text-error-fg text-sm font-bold">요금 내역을 불러오지 못했습니다.</p>
      ) : (billing.data?.records ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">산출된 요금 내역이 없습니다.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-semibold text-muted-foreground uppercase tracking-[0.07em] text-[11.5px] pb-3">기간</TableHead>
              <TableHead className="font-semibold text-muted-foreground uppercase tracking-[0.07em] text-[11.5px] pb-3">총 kWh</TableHead>
              <TableHead className="font-semibold text-muted-foreground uppercase tracking-[0.07em] text-[11.5px] pb-3">단가</TableHead>
              <TableHead className="font-semibold text-muted-foreground uppercase tracking-[0.07em] text-[11.5px] pb-3">기본료</TableHead>
              <TableHead className="font-semibold text-muted-foreground uppercase tracking-[0.07em] text-[11.5px] pb-3">사용료</TableHead>
              <TableHead className="font-semibold text-muted-foreground uppercase tracking-[0.07em] text-[11.5px] pb-3">총액</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(billing.data?.records ?? []).map((r) => (
              <TableRow key={r.id} className="border-none hover:bg-surface-2">
                <TableCell className="py-3 font-bold">
                  {r.year}.{String(r.month).padStart(2, "0")}
                </TableCell>
                <TableCell className="py-3 font-mono text-sm">{toNumber(r.totalKwh).toFixed(1)}</TableCell>
                <TableCell className="py-3 font-mono text-sm">₩{formatKrw(r.unitPrice)}</TableCell>
                <TableCell className="py-3 font-mono text-sm">₩{formatKrw(r.baseFee)}</TableCell>
                <TableCell className="py-3 font-mono text-sm">₩{formatKrw(r.usageFee)}</TableCell>
                <TableCell className="py-3 font-bold font-mono">₩{formatKrw(r.totalFee)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export function PowerZoneBillingTable(props: PowerZoneBillingTableProps) {
  return (
    <ErrorBoundary fallback={<div className="bg-surface p-6 rounded-2xl border border-error-bg shadow-[var(--shadow-card)]"><p className="text-sm text-error-fg font-bold">요금 표 렌더 오류</p></div>}>
      <PowerZoneBillingTableInner {...props} />
    </ErrorBoundary>
  );
}
