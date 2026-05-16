// 섹션3 주차 점유 상태 주입 — spotId 드롭다운(deviceId 자동), occupied Switch.
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useParkingStatusInjection } from "@/src/features/testInjection/hooks";
import {
  SEED_PARKING_SPOTS,
  nowLocalDateTime,
  pickRandom,
  randomDistanceCm,
} from "@/src/features/testInjection/seedData";
import type { InjectionLogEntry } from "@/src/features/testInjection/types";
import { ApiError } from "@/src/lib/api/types";
import { ROUTES } from "@/src/routes/paths";

interface Props {
  onLog: (entry: InjectionLogEntry) => void;
}

interface LastResult {
  success: boolean;
  text: string;
}

export function ParkingStatusSection({ onLog }: Props) {
  const mutation = useParkingStatusInjection();
  const [spotKey, setSpotKey] = useState<string>("");
  const [occupied, setOccupied] = useState(true);
  const [distanceCm, setDistanceCm] = useState<string>("");
  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  const selectedSpot = SEED_PARKING_SPOTS.find((s) => String(s.spotId) === spotKey);

  const doInject = (overrideSpotId?: number, overrideDeviceId?: number, overrideOccupied?: boolean) => {
    const spot = overrideSpotId
      ? { spotId: overrideSpotId, deviceId: overrideDeviceId! }
      : selectedSpot;
    if (!spot) { toast.error("주차면을 선택하세요."); return; }
    const occ = overrideOccupied ?? occupied;
    const dist = distanceCm ? Number(distanceCm) : randomDistanceCm(occ);
    const at = nowLocalDateTime();
    mutation.mutate(
      { spotId: spot.spotId, body: { deviceId: spot.deviceId, occupied: occ, distanceCm: dist } },
      {
        onSuccess: (data) => {
          const text = `spotId: ${data.spotId} → ${data.occupied ? "점유" : "비점유"}`;
          setLastResult({ success: true, text });
          toast.success("주차 상태 업데이트 완료");
          onLog({ id: crypto.randomUUID(), at, domain: "주차", summary: text, success: true });
        },
        onError: (err) => {
          const msg = (err instanceof ApiError ? err.serverMessage : null) ?? "주입 실패";
          setLastResult({ success: false, text: msg });
          toast.error(msg);
          onLog({ id: crypto.randomUUID(), at, domain: "주차", summary: msg, success: false });
        },
      },
    );
  };

  const handleRandom = () => {
    const spot = pickRandom(SEED_PARKING_SPOTS);
    const occ = Math.random() > 0.5;
    doInject(spot.spotId, spot.deviceId, occ);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h3 className="font-bold text-gray-800">섹션3 — 주차 점유 상태</h3>

      <div className="space-y-1.5">
        <Label className="text-xs">주차면 (spotId → deviceId 자동)</Label>
        <Select value={spotKey} onValueChange={setSpotKey}>
          <SelectTrigger className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100">
            <SelectValue placeholder="주차면 선택" />
          </SelectTrigger>
          <SelectContent>
            {SEED_PARKING_SPOTS.map((s) => (
              <SelectItem key={s.spotId} value={String(s.spotId)} className="text-xs">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedSpot && (
          <p className="text-xs text-gray-400">deviceId: {selectedSpot.deviceId} (자동)</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Label className="text-xs">점유 여부</Label>
        <div className="flex items-center gap-2">
          <Switch checked={occupied} onCheckedChange={setOccupied} />
          <span className="text-xs text-gray-600">{occupied ? "점유 (true)" : "비점유 (false)"}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-xs">거리 distanceCm (선택)</Label>
          <button
            type="button"
            className="text-xs text-blue-500 underline"
            onClick={() => setDistanceCm(String(randomDistanceCm(occupied)))}
          >
            랜덤
          </button>
          {distanceCm && (
            <button type="button" className="text-xs text-gray-400 underline" onClick={() => setDistanceCm("")}>지우기</button>
          )}
        </div>
        <Input
          value={distanceCm}
          onChange={(e) => setDistanceCm(e.target.value)}
          type="number"
          placeholder="cm — 비우면 자동 랜덤"
          className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => doInject()}
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
          랜덤 자동 생성
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
          <Link to={ROUTES.PARKING} className="underline text-blue-500 block">
            주차 관리 화면에서 확인 →
          </Link>
        </div>
      )}
    </div>
  );
}
