// G10 회의실 리스트 탭 — 전체 예약 목록 (ADMIN).
// status 필터(전체/CONFIRMED/CHECKED_IN/CANCELLED/NO_SHOW) + 페이지네이션 + 행 클릭 시 상세 드로어 트리거.
import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useAllReservations } from "@/src/features/reservation/hooks";
import type {
  ReservationListItem,
  ReservationStatus,
} from "@/src/features/reservation/types";

const PAGE_SIZE = 10;

// 상태별 배지 색상.
const STATUS_BADGE: Record<ReservationStatus, string> = {
  CONFIRMED: "bg-info-bg text-info-fg",
  CHECKED_IN: "bg-success-bg text-success-fg",
  CANCELLED: "bg-surface-2 text-muted-foreground",
  NO_SHOW: "bg-error-bg text-error-fg",
};

const STATUS_LABEL: Record<ReservationStatus, string> = {
  CONFIRMED: "예약 확정",
  CHECKED_IN: "체크인 완료",
  CANCELLED: "취소됨",
  NO_SHOW: "노쇼",
};

interface ReservationListTableProps {
  onSelect: (id: number) => void;
}

export function ReservationListTable({ onSelect }: ReservationListTableProps) {
  const [status, setStatus] = useState<ReservationStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);

  const filter = {
    page,
    size: PAGE_SIZE,
    ...(status !== "ALL" ? { status } : {}),
  };
  const { data, isLoading, isError, error } = useAllReservations(filter);
  const items: ReservationListItem[] = data?.content ?? [];
  const totalPages = Math.max(data?.totalPages ?? 1, 1);
  const totalElements = data?.totalElements ?? 0;

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-[var(--shadow-card)] p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">예약 목록</h2>
          <p className="text-sm text-muted-foreground">총 {totalElements} 건</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as ReservationStatus | "ALL");
                setPage(0);
              }}
            >
              <SelectTrigger className="pl-9 w-44 h-10 rounded-xl bg-surface-2 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border">
                <SelectItem value="ALL">전체 상태</SelectItem>
                <SelectItem value="CONFIRMED">예약 확정</SelectItem>
                <SelectItem value="CHECKED_IN">체크인 완료</SelectItem>
                <SelectItem value="CANCELLED">취소됨</SelectItem>
                <SelectItem value="NO_SHOW">노쇼</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-3 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="py-12 text-center text-sm font-bold text-error-fg">
          예약 목록을 불러오지 못했습니다: {error?.message ?? ""}
        </p>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">예약이 없습니다.</p>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-2">
              <tr className="text-left text-[11.5px] font-semibold text-muted-foreground uppercase tracking-[0.07em]">
                <th className="px-4 py-3 whitespace-nowrap">예약자</th>
                <th className="px-4 py-3 whitespace-nowrap">회의실</th>
                <th className="px-4 py-3 whitespace-nowrap">시작</th>
                <th className="px-4 py-3 whitespace-nowrap">종료</th>
                <th className="px-4 py-3 whitespace-nowrap">상태</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-border hover:bg-surface-2 cursor-pointer"
                  onClick={() => onSelect(r.id)}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{r.userName}</td>
                  <td className="px-4 py-3 text-foreground">{r.zoneName}</td>
                  <td className="px-4 py-3 text-foreground">{formatDateTime(r.startTime)}</td>
                  <td className="px-4 py-3 text-foreground">{formatDateTime(r.endTime)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-[11px] font-bold px-2 py-1 rounded-full",
                        STATUS_BADGE[r.status],
                      )}
                    >
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            className="rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" /> 이전
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            className="rounded-xl"
          >
            다음 <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
