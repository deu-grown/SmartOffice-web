// 섹션2 센서 로그 주입 — 드롭다운/직접 입력 토글, 단건 주입, 반복 주입.
import { useEffect, useRef, useState } from "react";
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
import { useSensorLogInjection } from "@/src/features/testInjection/hooks";
import {
  SEED_SENSOR_DEVICES,
  nowLocalDateTime,
  randomSensorValue,
  sensorUnit,
} from "@/src/features/testInjection/seedData";
import type {
  InjectionLogEntry,
  SensorLogRequest,
  SensorType,
} from "@/src/features/testInjection/types";
import { ApiError } from "@/src/lib/api/types";
import { ROUTES } from "@/src/routes/paths";

interface Props {
  onLog: (entry: InjectionLogEntry) => void;
}

interface LastResult {
  success: boolean;
  text: string;
}

export function SensorLogSection({ onLog }: Props) {
  const mutation = useSensorLogInjection();
  const [inputMode, setInputMode] = useState<"device" | "direct">("device");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [zoneId, setZoneId] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [sensorType, setSensorType] = useState<SensorType>("TEMPERATURE");
  const [value, setValue] = useState<string>("");
  const [timestamp, setTimestamp] = useState<string>("");
  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  // 반복 주입 상태
  const [autoInterval, setAutoInterval] = useState<string>("5");
  const [autoCount, setAutoCount] = useState<string>("3");
  const [autoRemaining, setAutoRemaining] = useState<number>(0);
  const [autoRunning, setAutoRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 드롭다운 선택 시 zone·sensorType 자동 채움
  const handleDeviceSelect = (val: string) => {
    setSelectedDeviceId(val);
    const dev = SEED_SENSOR_DEVICES.find((d) => String(d.deviceId) === val);
    if (dev) {
      setZoneId(String(dev.zoneId));
      setSensorType(dev.sensorType);
      setDeviceId(String(dev.deviceId));
    }
  };

  const buildBody = (): SensorLogRequest | null => {
    const z = inputMode === "device" ? Number(zoneId) : Number(zoneId);
    const d = inputMode === "device" ? Number(deviceId) : Number(deviceId);
    const v = Number(value);
    const ts = timestamp || nowLocalDateTime();
    if (!z || !d || !sensorType || isNaN(v) || !v) {
      toast.error("필수 필드를 모두 입력하세요.");
      return null;
    }
    return { zoneId: z, deviceId: d, sensorType, value: v, unit: sensorUnit(sensorType), timestamp: ts };
  };

  const doInject = (overrideValue?: number) => {
    const body = buildBody();
    if (!body) return;
    if (overrideValue !== undefined) body.value = overrideValue;
    const at = nowLocalDateTime();
    mutation.mutate(body, {
      onSuccess: (data) => {
        const text = `logId: ${data.logId} — ${body.sensorType} ${body.value}${body.unit}`;
        setLastResult({ success: true, text });
        toast.success("센서 로그 주입 완료");
        onLog({ id: crypto.randomUUID(), at, domain: "센서", summary: text, success: true });
      },
      onError: (err) => {
        const msg = (err instanceof ApiError ? err.serverMessage : null) ?? "주입 실패";
        setLastResult({ success: false, text: msg });
        toast.error(msg);
        onLog({ id: crypto.randomUUID(), at, domain: "센서", summary: msg, success: false });
      },
    });
  };

  const startAuto = () => {
    const count = Number(autoCount);
    const interval = Number(autoInterval);
    if (!count || !interval) { toast.error("횟수와 간격을 입력하세요."); return; }
    if (!buildBody()) return;
    setAutoRemaining(count);
    setAutoRunning(true);
    let remaining = count;
    intervalRef.current = setInterval(() => {
      doInject(randomSensorValue(sensorType));
      remaining -= 1;
      setAutoRemaining(remaining);
      if (remaining <= 0) stopAuto();
    }, interval * 1000);
  };

  const stopAuto = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setAutoRunning(false);
    setAutoRemaining(0);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h3 className="font-bold text-gray-800">섹션2 — 센서 로그</h3>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500">입력 모드:</span>
        <button
          type="button"
          onClick={() => setInputMode("device")}
          className={cn("px-2 py-0.5 rounded-md", inputMode === "device" ? "bg-black text-white" : "border border-gray-200 text-gray-600")}
        >드롭다운</button>
        <button
          type="button"
          onClick={() => setInputMode("direct")}
          className={cn("px-2 py-0.5 rounded-md", inputMode === "direct" ? "bg-black text-white" : "border border-gray-200 text-gray-600")}
        >직접 입력</button>
      </div>

      {inputMode === "device" ? (
        <div className="space-y-1.5">
          <Label className="text-xs">센서 장치</Label>
          <Select value={selectedDeviceId} onValueChange={handleDeviceSelect}>
            <SelectTrigger className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100">
              <SelectValue placeholder="장치 선택" />
            </SelectTrigger>
            <SelectContent>
              {SEED_SENSOR_DEVICES.map((d) => (
                <SelectItem key={d.deviceId} value={String(d.deviceId)} className="text-xs">
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {zoneId && <p className="text-xs text-gray-400">zone: {zoneId} / type: {sensorType} / unit: {sensorUnit(sensorType)}</p>}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs">zoneId</Label>
            <Input value={zoneId} onChange={(e) => setZoneId(e.target.value)} type="number" placeholder="예: 5" className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">deviceId</Label>
            <Input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} type="number" placeholder="예: 3" className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">sensorType</Label>
            <Select value={sensorType} onValueChange={(v) => setSensorType(v as SensorType)}>
              <SelectTrigger className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["TEMPERATURE", "HUMIDITY", "CO2", "POWER"] as SensorType[]).map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-xs">측정값</Label>
            <button type="button" className="text-xs text-blue-500 underline" onClick={() => setValue(String(randomSensorValue(sensorType)))}>랜덤</button>
          </div>
          <div className="flex gap-1.5">
            <Input value={value} onChange={(e) => setValue(e.target.value)} type="number" step="0.1" placeholder="측정값" className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100 flex-1" />
            <Input value={sensorUnit(sensorType)} disabled className="h-9 text-xs rounded-xl bg-gray-100 border-gray-100 w-14 text-center" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-xs">타임스탬프</Label>
            <button type="button" className="text-xs text-blue-500 underline" onClick={() => setTimestamp(nowLocalDateTime())}>지금</button>
            {timestamp && <button type="button" className="text-xs text-gray-400 underline" onClick={() => setTimestamp("")}>지우기</button>}
          </div>
          <Input type="datetime-local" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100" />
        </div>
      </div>

      <Button onClick={() => doInject()} disabled={mutation.isPending || autoRunning} className="bg-black text-white hover:bg-black/90 rounded-xl h-9 text-xs">
        {mutation.isPending ? "주입 중..." : "단건 주입"}
      </Button>

      {/* 반복 주입 */}
      <div className="border border-gray-100 rounded-xl p-3 space-y-2">
        <p className="text-xs font-semibold text-gray-600">반복 주입</p>
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs">간격(초)</Label>
            <Input value={autoInterval} onChange={(e) => setAutoInterval(e.target.value)} type="number" min="1" className="h-8 text-xs rounded-lg bg-gray-50 border-gray-100 w-20" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">횟수</Label>
            <Input value={autoCount} onChange={(e) => setAutoCount(e.target.value)} type="number" min="1" className="h-8 text-xs rounded-lg bg-gray-50 border-gray-100 w-20" />
          </div>
          {autoRunning ? (
            <Button variant="outline" onClick={stopAuto} className="h-8 text-xs rounded-lg border-red-200 text-red-500 hover:bg-red-50">
              중단 (남은 {autoRemaining}회)
            </Button>
          ) : (
            <Button variant="outline" onClick={startAuto} disabled={mutation.isPending} className="h-8 text-xs rounded-lg border-gray-200">
              반복 시작
            </Button>
          )}
        </div>
      </div>

      {lastResult && (
        <div className={cn("rounded-xl p-3 text-xs font-medium space-y-1", lastResult.success ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-600")}>
          <p>{lastResult.text}</p>
          <Link to={ROUTES.DASHBOARD} className="underline text-blue-500 block">통합 관제 화면에서 확인 →</Link>
        </div>
      )}
    </div>
  );
}
