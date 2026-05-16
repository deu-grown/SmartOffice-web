// 섹션1 NFC 출입 태그 주입 — 드롭다운/직접 입력 토글, 단건/랜덤 직원 주입.
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTagEventInjection } from "@/src/features/testInjection/hooks";
import {
  SEED_NFC_CARDS,
  SEED_NFC_CARDS_ACTIVE,
  SEED_NFC_READERS,
  nowLocalDateTime,
  pickRandom,
} from "@/src/features/testInjection/seedData";
import type { InjectionLogEntry, TagEventResponse } from "@/src/features/testInjection/types";
import { ApiError } from "@/src/lib/api/types";
import { ROUTES } from "@/src/routes/paths";

interface Props {
  onLog: (entry: InjectionLogEntry) => void;
}

interface LastResult {
  success: boolean;
  text: string;
}

export function NfcTagSection({ onLog }: Props) {
  const mutation = useTagEventInjection();
  const [uidMode, setUidMode] = useState<"dropdown" | "direct">("dropdown");
  const [deviceId, setDeviceId] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [uidDirect, setUidDirect] = useState<string>("");
  const [direction, setDirection] = useState<"IN" | "OUT">("IN");
  const [taggedAt, setTaggedAt] = useState<string>("");
  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  const activeUid = uidMode === "dropdown" ? uid : uidDirect;

  const handleInject = (overrideDeviceId?: number, overrideUid?: string) => {
    const dId = overrideDeviceId ?? Number(deviceId);
    const u = overrideUid ?? activeUid;
    if (!dId || !u) {
      toast.error("deviceId 와 uid 를 입력하세요.");
      return;
    }
    const at = nowLocalDateTime();
    mutation.mutate(
      { deviceId: dId, uid: u, direction, taggedAt: taggedAt || undefined },
      {
        onSuccess: (data: TagEventResponse) => {
          const text =
            data.authResult === "APPROVED"
              ? `APPROVED — userId: ${data.userId}`
              : `DENIED — ${data.denyReason ?? "사유 없음"}`;
          setLastResult({ success: data.authResult === "APPROVED", text });
          toast.success(`태그 처리 완료: ${data.authResult}`);
          onLog({ id: crypto.randomUUID(), at, domain: "NFC 태그", summary: `uid=${u} → ${data.authResult}`, success: data.authResult === "APPROVED" });
        },
        onError: (err) => {
          const msg = (err instanceof ApiError ? err.serverMessage : null) ?? "주입 실패";
          setLastResult({ success: false, text: msg });
          toast.error(msg);
          onLog({ id: crypto.randomUUID(), at, domain: "NFC 태그", summary: `uid=${u} 오류: ${msg}`, success: false });
        },
      },
    );
  };

  const handleRandom = () => {
    const card = pickRandom(SEED_NFC_CARDS_ACTIVE);
    const reader = pickRandom(SEED_NFC_READERS.filter((r) => r.deviceId !== 11));
    handleInject(reader.deviceId, card.uid);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h3 className="font-bold text-gray-800">섹션1 — NFC 출입 태그</h3>

      <div className="grid grid-cols-2 gap-3">
        {/* deviceId */}
        <div className="space-y-1.5">
          <Label className="text-xs">NFC 리더기 (deviceId)</Label>
          <Select value={deviceId} onValueChange={setDeviceId}>
            <SelectTrigger className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              {SEED_NFC_READERS.map((r) => (
                <SelectItem key={r.deviceId} value={String(r.deviceId)} className="text-xs">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* direction */}
        <div className="space-y-1.5">
          <Label className="text-xs">방향</Label>
          <Select value={direction} onValueChange={(v) => setDirection(v as "IN" | "OUT")}>
            <SelectTrigger className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN">IN (입장)</SelectItem>
              <SelectItem value="OUT">OUT (퇴장)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* uid */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">NFC 카드 UID</Label>
          <button
            type="button"
            className="text-xs text-blue-500 underline"
            onClick={() => setUidMode((m) => (m === "dropdown" ? "direct" : "dropdown"))}
          >
            {uidMode === "dropdown" ? "직접 입력으로 전환" : "드롭다운으로 전환"}
          </button>
        </div>
        {uidMode === "dropdown" ? (
          <Select value={uid} onValueChange={setUid}>
            <SelectTrigger className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100">
              <SelectValue placeholder="카드 선택" />
            </SelectTrigger>
            <SelectContent>
              {SEED_NFC_CARDS.map((c) => (
                <SelectItem key={c.uid} value={c.uid} className="text-xs">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={uidDirect}
            onChange={(e) => setUidDirect(e.target.value)}
            placeholder="예: ZZZZ0000"
            className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100"
          />
        )}
      </div>

      {/* taggedAt */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-xs">태그 시각 (선택 — 비우면 서버 시각)</Label>
          <button
            type="button"
            className="text-xs text-blue-500 underline"
            onClick={() => setTaggedAt(nowLocalDateTime())}
          >
            지금
          </button>
          {taggedAt && (
            <button
              type="button"
              className="text-xs text-gray-400 underline"
              onClick={() => setTaggedAt("")}
            >
              지우기
            </button>
          )}
        </div>
        <Input
          type="datetime-local"
          value={taggedAt}
          onChange={(e) => setTaggedAt(e.target.value)}
          className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => handleInject()}
          disabled={mutation.isPending}
          className="bg-black text-white hover:bg-black/90 rounded-xl h-9 text-xs"
        >
          {mutation.isPending ? "주입 중..." : "단건 주입"}
        </Button>
        <Button
          variant="outline"
          onClick={handleRandom}
          disabled={mutation.isPending}
          className="rounded-xl h-9 text-xs border-gray-200"
        >
          랜덤 직원으로 주입
        </Button>
      </div>

      {lastResult && (
        <div
          className={cn(
            "rounded-xl p-3 text-xs font-medium space-y-1",
            lastResult.success
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-red-50 border border-red-200 text-red-600",
          )}
        >
          <p>{lastResult.text}</p>
          <Link to={ROUTES.ACCESS_LOGS} className="underline text-blue-500 block">
            출입 기록 관리 화면에서 확인 →
          </Link>
        </div>
      )}
    </div>
  );
}
