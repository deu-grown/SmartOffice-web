// G11 NFC 카드 목록 테이블 — 필터(userId/cardType/status) + stat 카드 4종.
// userId 필터는 직원 검색(useUsers) 결합으로 PersonnelDetailDrawer 이외 진입 시에도 동작.
import { useMemo, useState } from "react";
import { Search, KeyRound, ShieldCheck, AlertTriangle, Power } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useNfcCards } from "@/src/features/nfccard/hooks";
import type { NfcCardListItem, NfcCardStatus } from "@/src/features/nfccard/types";

const STATUS_BADGE: Record<NfcCardStatus, string> = {
  ACTIVE: "bg-success-bg text-success-fg",
  LOST: "bg-error-bg text-error-fg",
  INACTIVE: "bg-surface-2 text-muted-foreground",
};
const STATUS_LABEL: Record<NfcCardStatus, string> = {
  ACTIVE: "활성",
  LOST: "분실",
  INACTIVE: "비활성",
};

interface NfcCardListTableProps {
  onSelect: (id: number) => void;
}

export function NfcCardListTable({ onSelect }: NfcCardListTableProps) {
  const [status, setStatus] = useState<NfcCardStatus | "ALL">("ALL");
  const [cardType, setCardType] = useState<string>("ALL");
  const [keyword, setKeyword] = useState("");

  const filter = {
    ...(status !== "ALL" ? { status } : {}),
    ...(cardType !== "ALL" ? { cardType } : {}),
  };
  const { data, isLoading, isError, error } = useNfcCards(filter);
  const cards: NfcCardListItem[] = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return cards;
    return cards.filter(
      (c) =>
        c.userName.toLowerCase().includes(k) ||
        c.employeeNumber.toLowerCase().includes(k) ||
        c.uid.toLowerCase().includes(k),
    );
  }, [cards, keyword]);

  // stat 카드 4종 (서버 응답 기준 — 필터 전 raw 카운트).
  const stats = useMemo(() => {
    const all = cards.length;
    const active = cards.filter((c) => c.status === "ACTIVE").length;
    const lost = cards.filter((c) => c.status === "LOST").length;
    const inactive = cards.filter((c) => c.status === "INACTIVE").length;
    return { all, active, lost, inactive };
  }, [cards]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<KeyRound className="w-5 h-5" />} label="총 카드" value={stats.all} accent="bg-surface-2 text-foreground" />
        <StatCard icon={<ShieldCheck className="w-5 h-5" />} label="활성" value={stats.active} accent="bg-success-bg text-success-fg" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="분실" value={stats.lost} accent="bg-error-bg text-error-fg" />
        <StatCard icon={<Power className="w-5 h-5" />} label="비활성" value={stats.inactive} accent="bg-surface-2 text-muted-foreground" />
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-[var(--shadow-card)] p-6 space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">발급 카드 목록</h2>
            <p className="text-sm text-muted-foreground">총 {filtered.length} 건 (서버 {cards.length})</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="이름/사번/UID 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-9 w-56 h-10 rounded-xl bg-surface-2 border-border"
              />
            </div>
            <Select value={cardType} onValueChange={(v) => setCardType(v)}>
              <SelectTrigger className="w-32 h-10 rounded-xl bg-surface-2 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border">
                <SelectItem value="ALL">전체 유형</SelectItem>
                <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                <SelectItem value="VISITOR">VISITOR</SelectItem>
                <SelectItem value="TEMP">TEMP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as NfcCardStatus | "ALL")}>
              <SelectTrigger className="w-32 h-10 rounded-xl bg-surface-2 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border">
                <SelectItem value="ALL">전체 상태</SelectItem>
                <SelectItem value="ACTIVE">활성</SelectItem>
                <SelectItem value="LOST">분실</SelectItem>
                <SelectItem value="INACTIVE">비활성</SelectItem>
              </SelectContent>
            </Select>
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
            NFC 카드 목록을 불러오지 못했습니다: {error?.message ?? ""}
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">조건에 맞는 카드가 없습니다.</p>
        ) : (
          <div className="border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-2">
                <tr className="text-left text-[11.5px] font-semibold text-muted-foreground uppercase tracking-[0.07em]">
                  <th className="px-4 py-3 whitespace-nowrap">UID</th>
                  <th className="px-4 py-3 whitespace-nowrap">유형</th>
                  <th className="px-4 py-3 whitespace-nowrap">소유자</th>
                  <th className="px-4 py-3 whitespace-nowrap">발급일</th>
                  <th className="px-4 py-3 whitespace-nowrap">만료일</th>
                  <th className="px-4 py-3 whitespace-nowrap">상태</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-border hover:bg-surface-2 cursor-pointer"
                    onClick={() => onSelect(c.id)}
                  >
                    <td className="px-4 py-3 font-mono text-foreground">{c.uid}</td>
                    <td className="px-4 py-3 text-foreground">{c.cardType}</td>
                    <td className="px-4 py-3 text-foreground">
                      {c.userName} <span className="text-muted-foreground">({c.employeeNumber})</span>
                    </td>
                    <td className="px-4 py-3 text-foreground">{formatDate(c.issuedAt)}</td>
                    <td className="px-4 py-3 text-foreground">
                      {c.expiredAt ? formatDate(c.expiredAt) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-[11px] font-bold px-2 py-1 rounded-full",
                          STATUS_BADGE[c.status],
                        )}
                      >
                        {STATUS_LABEL[c.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border shadow-[var(--shadow-card)] p-5 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", accent)}>{icon}</div>
      <div>
        <p className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}
