// 섹션6 회의실 NFC 체크인 — reservationId 드롭다운(CONFIRMED 예약 목록)/직접 입력 토글.
// 확인 3: 백엔드가 nfcTagId 를 검증하지 않음. 성공 조건은 시간 창(시작-10분~종료) 준수.
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
import { useAllReservations } from "@/src/features/reservation/hooks";
import { useReservationCheckInInjection } from "@/src/features/testInjection/hooks";
import { nowLocalDateTime } from "@/src/features/testInjection/seedData";
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

export function ReservationCheckInSection({ onLog }: Props) {
  const mutation = useReservationCheckInInjection();
  const [idMode, setIdMode] = useState<"dropdown" | "direct">("dropdown");
  const [selectedId, setSelectedId] = useState<string>("");
  const [directId, setDirectId] = useState<string>("");
  const [nfcTagId, setNfcTagId] = useState<string>("ADMIN-CARD-UID-001");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  // CONFIRMED 예약만 드롭다운에 표시
  const { data, isLoading } = useAllReservations({ status: "CONFIRMED", size: 50 });
  const reservations = data?.content ?? [];

  const activeId = idMode === "dropdown" ? Number(selectedId) : Number(directId);

  const handleCheckIn = () => {
    if (!activeId || !nfcTagId.trim()) {
      toast.error("예약 ID와 nfcTagId 를 입력하세요.");
      return;
    }
    const at = nowLocalDateTime();
    mutation.mutate(
      {
        id: activeId,
        body: {
          nfcTagId,
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
        },
      },
      {
        onSuccess: (data) => {
          const text = `체크인 완료 — status: ${data.status} / checkInTime: ${data.checkInTime}`;
          setLastResult({ success: true, text });
          toast.success("체크인 완료");
          onLog({ id: crypto.randomUUID(), at, domain: "예약 체크인", summary: text, success: true });
        },
        onError: (err) => {
          const msg = (err instanceof ApiError ? err.serverMessage : null) ?? "체크인 실패";
          setLastResult({ success: false, text: msg });
          toast.error(msg);
          onLog({ id: crypto.randomUUID(), at, domain: "예약 체크인", summary: msg, success: false });
        },
      },
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h3 className="font-bold text-gray-800">섹션6 — 회의실 NFC 체크인</h3>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 space-y-1">
        <p className="font-semibold">⚠️ 시간 창 제약</p>
        <p>예약 시작 <strong>10분 전 ~ 종료 시각</strong> 범위 안에서만 체크인이 성공합니다.</p>
        <p>회의실 관리에서 &ldquo;지금&rdquo;을 포함하는 예약을 먼저 생성하세요.</p>
        <p className="text-gray-500">nfcTagId 는 임의 비공백 문자열 가능 (백엔드 미검증)</p>
      </div>

      {/* reservationId */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">예약 ID</Label>
          <button
            type="button"
            className="text-xs text-blue-500 underline"
            onClick={() => setIdMode((m) => (m === "dropdown" ? "direct" : "dropdown"))}
          >
            {idMode === "dropdown" ? "직접 입력으로 전환" : "드롭다운으로 전환"}
          </button>
        </div>
        {idMode === "dropdown" ? (
          isLoading ? (
            <p className="text-xs text-gray-400">예약 목록 로딩 중...</p>
          ) : reservations.length === 0 ? (
            <p className="text-xs text-gray-400">CONFIRMED 예약 없음 — 직접 입력으로 전환하거나 예약 생성 후 새로고침</p>
          ) : (
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100">
                <SelectValue placeholder="예약 선택" />
              </SelectTrigger>
              <SelectContent>
                {reservations.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)} className="text-xs">
                    예약#{r.id} · {r.userName} · {r.zoneName} · {r.startTime.slice(0, 16)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        ) : (
          <Input
            value={directId}
            onChange={(e) => setDirectId(e.target.value)}
            type="number"
            placeholder="예약 ID 직접 입력"
            className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100"
          />
        )}
      </div>

      {/* nfcTagId */}
      <div className="space-y-1.5">
        <Label className="text-xs">nfcTagId (임의 비공백 문자열 가능)</Label>
        <Input
          value={nfcTagId}
          onChange={(e) => setNfcTagId(e.target.value)}
          placeholder="ADMIN-CARD-UID-001"
          className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100"
        />
      </div>

      {/* 위치 (선택) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">위도 latitude (선택)</Label>
          <Input value={latitude} onChange={(e) => setLatitude(e.target.value)} type="number" step="any" placeholder="35.0" className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">경도 longitude (선택)</Label>
          <Input value={longitude} onChange={(e) => setLongitude(e.target.value)} type="number" step="any" placeholder="129.0" className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100" />
        </div>
      </div>

      <Button
        onClick={handleCheckIn}
        disabled={mutation.isPending}
        className="bg-black text-white hover:bg-black/90 rounded-xl h-9 text-xs"
      >
        {mutation.isPending ? "체크인 중..." : "체크인"}
      </Button>

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
          <Link to={ROUTES.MEETING_ROOMS} className="underline text-blue-500 block">
            회의실 관리 화면에서 확인 →
          </Link>
        </div>
      )}
    </div>
  );
}
