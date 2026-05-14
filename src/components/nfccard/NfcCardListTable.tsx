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
  ACTIVE: "bg-emerald-50 text-emerald-600",
  LOST: "bg-red-50 text-red-500",
  INACTIVE: "bg-gray-100 text-gray-500",
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
        <StatCard icon={<KeyRound className="w-5 h-5" />} label="총 카드" value={stats.all} accent="bg-gray-100 text-gray-700" />
        <StatCard icon={<ShieldCheck className="w-5 h-5" />} label="활성" value={stats.active} accent="bg-emerald-50 text-emerald-600" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="분실" value={stats.lost} accent="bg-red-50 text-red-500" />
        <StatCard icon={<Power className="w-5 h-5" />} label="비활성" value={stats.inactive} accent="bg-gray-100 text-gray-500" />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">발급 카드 목록</h2>
            <p className="text-sm text-gray-400">총 {filtered.length} 건 (서버 {cards.length})</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <Input
                placeholder="이름/사번/UID 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-9 w-56 h-10 rounded-xl bg-gray-50 border-gray-100"
              />
            </div>
            <Select value={cardType} onValueChange={(v) => setCardType(v)}>
              <SelectTrigger className="w-32 h-10 rounded-xl bg-gray-50 border-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체 유형</SelectItem>
                <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                <SelectItem value="VISITOR">VISITOR</SelectItem>
                <SelectItem value="TEMP">TEMP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as NfcCardStatus | "ALL")}>
              <SelectTrigger className="w-32 h-10 rounded-xl bg-gray-50 border-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
          <p className="py-12 text-center text-sm font-bold text-red-500">
            NFC 카드 목록을 불러오지 못했습니다: {error?.message ?? ""}
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-gray-400">조건에 맞는 카드가 없습니다.</p>
        ) : (
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-bold text-gray-500 uppercase">
                  <th className="px-4 py-3">UID</th>
                  <th className="px-4 py-3">유형</th>
                  <th className="px-4 py-3">소유자</th>
                  <th className="px-4 py-3">발급일</th>
                  <th className="px-4 py-3">만료일</th>
                  <th className="px-4 py-3">상태</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSelect(c.id)}
                  >
                    <td className="px-4 py-3 font-mono text-gray-900">{c.uid}</td>
                    <td className="px-4 py-3 text-gray-700">{c.cardType}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {c.userName} <span className="text-gray-400">({c.employeeNumber})</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{formatDate(c.issuedAt)}</td>
                    <td className="px-4 py-3 text-gray-700">
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
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", accent)}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}
