// G11 NFC 카드 관리 페이지 컨테이너.
// ADMIN 5종 흡수 — 목록/상세/발급/수정/삭제. AdminRoute 는 main.tsx /* 단일 wrap.
import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { NfcCardDetailDrawer } from "@/src/components/nfccard/NfcCardDetailDrawer";
import { NfcCardIssueModal } from "@/src/components/nfccard/NfcCardIssueModal";
import { NfcCardListTable } from "@/src/components/nfccard/NfcCardListTable";

export function NfcCardManagement() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">NFC 카드 관리</h1>
          <p className="text-gray-500 text-lg font-medium">
            발급된 카드를 관리하고 분실·재발급·삭제를 처리합니다.
          </p>
        </div>
        <Button
          onClick={() => setIssueOpen(true)}
          className="bg-black text-white hover:bg-black/90 rounded-2xl font-bold h-12 px-5"
        >
          <Plus className="w-4 h-4 mr-1" /> 카드 발급
        </Button>
      </header>

      <NfcCardListTable onSelect={(id) => setSelectedId(id)} />

      <NfcCardIssueModal open={issueOpen} onClose={() => setIssueOpen(false)} />
      <NfcCardDetailDrawer cardId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
