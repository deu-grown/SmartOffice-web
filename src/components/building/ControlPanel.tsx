// 제어 패널 — 출입문/조명/장치 제어 명령 발송 (묶음 4 커밋 4.2).
// 명령 발송 + 이력 표시. useDevices() 와 연동하여 zone 의 장치 목록 셀렉터.
import { useMemo, useState } from "react";
import { Power, Lightbulb, Wind, DoorOpen, Fan, Loader2 } from "lucide-react";
// Power 아이콘은 헤더에서만 사용.
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ErrorBoundary } from "@/src/components/common/ErrorBoundary";

import { useSendControl, useControlHistory } from "@/src/features/control/hooks";
import { useDevices } from "@/src/features/device/hooks";

// V8 시드 history (AC 9건/LIGHT 4건/FAN 2건) 및 IoT 합의 가능 명령으로 정합.
// 백엔드 control_commands.command_type = varchar(15) 자유 string pass-through 이므로 IoT 가 이해할 수 있는 값이어야 함.
// 채택 시 BACKEND_SUGGESTIONS #12 (control commands 메타 엔드포인트) 후 hook 으로 전환.
const QUICK_COMMANDS = [
  { id: "AC", label: "공조 가동", icon: Wind, color: "bg-blue-50 text-blue-600" },
  { id: "LIGHT", label: "조명 토글", icon: Lightbulb, color: "bg-yellow-50 text-yellow-600" },
  { id: "FAN", label: "환기팬", icon: Fan, color: "bg-cyan-50 text-cyan-600" },
  { id: "DOOR_LOCK", label: "출입문 잠금", icon: DoorOpen, color: "bg-red-50 text-red-600" },
];

interface ControlPanelProps {
  zoneId: number | undefined;
}

function ControlPanelInner({ zoneId }: ControlPanelProps) {
  const devicesQuery = useDevices();
  const sendMutation = useSendControl();
  const historyQuery = useControlHistory(zoneId);

  const zoneDevices = useMemo(
    () => (devicesQuery.data ?? []).filter((d) => (zoneId !== undefined ? d.zoneId === zoneId : true)),
    [devicesQuery.data, zoneId]
  );

  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [commandValue, setCommandValue] = useState("");

  const handleSend = (command: string) => {
    if (zoneId === undefined) {
      toast.error("zone 을 선택해 주세요.");
      return;
    }
    if (selectedDeviceId === null) {
      toast.error("장치를 선택해 주세요.");
      return;
    }
    sendMutation.mutate(
      { zoneId, deviceId: selectedDeviceId, command, value: commandValue.trim() || undefined },
      {
        onSuccess: (res) => {
          toast.success(`제어 명령이 발송되었습니다. (#${res.controlId})`);
          setCommandValue("");
        },
        onError: (err: Error) => toast.error(err.message || "제어 발송에 실패했습니다."),
      }
    );
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Power className="w-5 h-5 text-gray-400" />
          장치 제어
        </h3>
        {sendMutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-gray-400 ml-1">대상 장치</label>
          <Select
            value={selectedDeviceId !== null ? String(selectedDeviceId) : ""}
            onValueChange={(v) => setSelectedDeviceId(v ? Number(v) : null)}
            disabled={zoneDevices.length === 0}
          >
            <SelectTrigger className="h-11 rounded-2xl">
              {/* SelectValue children 자동 매핑 결함 회피 — 명시 텍스트 렌더 (옵션 b, 사용처 1곳). */}
              {(() => {
                const sel = selectedDeviceId !== null ? zoneDevices.find((d) => d.id === selectedDeviceId) : undefined;
                return sel ? (
                  <span className="truncate">
                    {sel.name} ({sel.deviceType})
                  </span>
                ) : (
                  <SelectValue placeholder={zoneDevices.length === 0 ? "장치 없음" : "장치 선택"} />
                );
              })()}
            </SelectTrigger>
            <SelectContent>
              {zoneDevices.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name} ({d.deviceType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 ml-1">값 (선택)</label>
          <Input value={commandValue} onChange={(e) => setCommandValue(e.target.value)} className="h-11 rounded-2xl font-mono" placeholder="예: 24" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_COMMANDS.map((c) => (
          <button
            key={c.id}
            onClick={() => handleSend(c.id)}
            disabled={sendMutation.isPending || selectedDeviceId === null}
            className={cn(
              "p-4 rounded-2xl border-2 border-gray-50 transition-all flex flex-col items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-200",
              c.color
            )}
          >
            <c.icon className="w-6 h-6" />
            <span className="text-xs font-bold">{c.label}</span>
          </button>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-50">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">최근 명령 이력</h4>
        {historyQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (historyQuery.data?.controlList ?? []).length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">제어 이력이 없습니다.</p>
        ) : (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {(historyQuery.data?.controlList ?? []).slice(0, 8).map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-gray-400">#{h.id}</span>
                  <span className="font-bold text-gray-700 truncate">{h.command}</span>
                  <span className="text-gray-400 font-mono">→ device #{h.deviceId}</span>
                </div>
                <Badge className={cn("rounded-full font-bold px-2 py-0.5 border-none text-[10px]", h.status === "COMPLETED" ? "bg-green-50 text-green-600" : h.status === "FAILED" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500")}>
                  {h.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ControlPanel(props: ControlPanelProps) {
  return (
    <ErrorBoundary fallback={<div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm"><p className="text-sm text-red-500 font-bold">제어 패널 렌더 오류</p></div>}>
      <ControlPanelInner {...props} />
    </ErrorBoundary>
  );
}
