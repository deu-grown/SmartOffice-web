// 건물·환경·제어 페이지 — features/sensor + features/control + features/power 위젯 조립.
// POWER 미터 보유 여부는 GET /power/zones 응답으로 동적 판단.
import { useMemo, useState } from "react";
import { Building2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ZoneSelect } from "@/src/components/common/ZoneSelect";
import { useZones } from "@/src/features/zone/hooks";
import { usePowerZones } from "@/src/features/power/hooks";

import { SensorChart } from "../building/SensorChart";
import { ControlPanel } from "../building/ControlPanel";
import { PowerHourlyChart } from "../building/PowerHourlyChart";
import { PowerZoneBillingTable } from "../building/PowerZoneBillingTable";
import { PowerBillingCalculateModal } from "../building/PowerBillingCalculateModal";

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH = now.getMonth() + 1;

export function BuildingManagement() {
  const zonesQuery = useZones();
  const allZones = useMemo(() => zonesQuery.data ?? [], [zonesQuery.data]);

  const { data: powerZones } = usePowerZones();
  const powerZoneIds = useMemo(
    () => new Set((powerZones ?? []).map((z) => z.zoneId)),
    [powerZones]
  );

  // 선택 가능한 zone: AREA/ROOM (FLOOR 제외, 센서/제어가 실제 설치되는 단위).
  const operableZones = useMemo(
    () => allZones.filter((z) => z.zoneType !== "FLOOR"),
    [allZones]
  );

  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [calcOpen, setCalcOpen] = useState(false);

  // 초기 선택: POWER zone 의 첫 항목(전력 위젯 즉시 표시), 없으면 operable 첫 zone.
  const effectiveZoneId = useMemo(() => {
    if (selectedZoneId !== null) return selectedZoneId;
    if (powerZones && powerZones.length > 0) return powerZones[0].zoneId;
    return operableZones[0]?.id ?? null;
  }, [selectedZoneId, powerZones, operableZones]);

  const hasPowerMeter = useMemo(
    () => effectiveZoneId !== null && powerZoneIds.has(effectiveZoneId),
    [effectiveZoneId, powerZoneIds]
  );

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900 flex items-center gap-3">
            <Building2 className="w-10 h-10 text-gray-400" />
            건물·환경·제어
          </h1>
          <p className="text-gray-500 text-lg font-medium">구역별 환경 센서·장치 제어·전력 관리</p>
        </div>
        <div className="flex gap-2 items-center">
          <ZoneSelect
            options={operableZones.map((z) => ({ id: z.id, name: z.name, suffix: `(${z.zoneType})` }))}
            value={effectiveZoneId ?? undefined}
            onChange={(id) => setSelectedZoneId(id)}
            triggerClassName="w-[220px] bg-white border-gray-100 rounded-xl h-12 font-bold"
            placeholder="구역 선택"
          />
          <Button onClick={() => setCalcOpen(true)} className="bg-red-500 text-white hover:bg-red-600 rounded-xl h-12 px-6 font-bold flex items-center gap-2">
            <Zap className="w-4 h-4" />
            전력 요금 산출
          </Button>
        </div>
      </header>

      {/* 환경 센서 */}
      <SensorChart zoneId={effectiveZoneId ?? undefined} />

      {/* 제어 패널 */}
      <ControlPanel zoneId={effectiveZoneId ?? undefined} />

      {/* 전력 위젯 — POWER 미터 보유 zone 만 활성 */}
      {hasPowerMeter ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PowerHourlyChart zoneId={effectiveZoneId ?? undefined} />
          <PowerZoneBillingTable zoneId={effectiveZoneId ?? undefined} year={CURRENT_YEAR} month={CURRENT_MONTH} />
        </div>
      ) : (
        <div className="bg-gray-50 rounded-3xl p-6 border-2 border-dashed border-gray-200 text-center">
          <Zap className="w-6 h-6 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-500">
            본 구역은 POWER 미터 미보유 — 전력 위젯이 비활성화됩니다.
          </p>
          <p className="text-[10px] text-gray-400 mt-1 font-mono">
            지원 zone: {(powerZones ?? []).map((p) => p.zoneName).join(" · ")}
          </p>
        </div>
      )}

      <PowerBillingCalculateModal
        open={calcOpen}
        onClose={() => setCalcOpen(false)}
        defaultYear={CURRENT_YEAR}
        defaultMonth={CURRENT_MONTH}
      />
    </div>
  );
}
