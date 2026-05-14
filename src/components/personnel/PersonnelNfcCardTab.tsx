// G11 G3 연계 — PersonnelDetailDrawer 의 NFC 카드 탭.
// 직원별 NFC 카드 목록 (useNfcCards({ userId })) + 발급 모달 트리거.
import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { NfcCardIssueModal } from "@/src/components/nfccard/NfcCardIssueModal";
import { useNfcCards } from "@/src/features/nfccard/hooks";
import type { NfcCardStatus } from "@/src/features/nfccard/types";

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

interface PersonnelNfcCardTabProps {
  user: { id: number; name: string; employeeNumber: string };
}

export function PersonnelNfcCardTab({ user }: PersonnelNfcCardTabProps) {
  const { data, isLoading, isError, error } = useNfcCards({ userId: user.id });
  const cards = data ?? [];
  const [issueOpen, setIssueOpen] = useState(false);

  return (
    <div className="py-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-medium">
          {user.name} 직원에게 발급된 카드 {cards.length} 건
        </p>
        <Button
          size="sm"
          onClick={() => setIssueOpen(true)}
          className="bg-black text-white hover:bg-black/90 rounded-xl font-bold h-9 px-3"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> 카드 발급
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="py-4 text-sm font-bold text-red-500">
          카드 목록을 불러오지 못했습니다: {error?.message ?? ""}
        </p>
      ) : cards.length === 0 ? (
        <p className="py-12 text-center text-gray-400">발급된 카드가 없습니다.</p>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar">
          {cards.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-gray-50"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-mono font-bold text-gray-900">{c.uid}</p>
                <p className="text-xs text-gray-400 font-medium">
                  {c.cardType} · 발급 {c.issuedAt.slice(0, 10)}
                  {c.expiredAt && ` · 만료 ${c.expiredAt.slice(0, 10)}`}
                </p>
              </div>
              <span
                className={cn(
                  "text-[11px] font-bold px-2 py-1 rounded-full",
                  STATUS_BADGE[c.status],
                )}
              >
                {STATUS_LABEL[c.status]}
              </span>
            </div>
          ))}
        </div>
      )}

      <NfcCardIssueModal
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        prefillUser={user}
      />
    </div>
  );
}
