// 제어 패널 — 출입문/조명/장치 제어 명령 발송 (묶음 4 커밋 4.2).
// 명령 발송 + 이력 표시. useDevices() 와 연동하여 zone 의 장치 목록 셀렉터.
import { useMemo, useState } from "react";
import { Power, Lightbulb, Wind, DoorOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const QUICK_COMMANDS = [
  { id: "LIGHT_ON", label: "조명 ON", icon: Lightbulb, color: "bg-yellow-50 text-yellow-600" },
  { id: "LIGHT_OFF", label: "조명 OFF", icon: Power, color: "bg-gray-100 text-gray-500" },
  { id: "SET_TEMPERATURE", label: "공조 가동", icon: Wind, color: "bg-blue-50 text-blue-600" },
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
              <SelectValue placeholder={zoneDevices.length === 0 ? "장치 없음" : "장치 선택"} />
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
