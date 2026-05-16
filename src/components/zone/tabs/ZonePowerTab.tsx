// 구역 상세 - 전력 탭. POWER 미터 보유 여부는 GET /power/zones 응답으로 동적 판단.
import { Zap } from "lucide-react";
import { usePowerZones } from "@/src/features/power/hooks";
import { PowerHourlyChart } from "@/src/components/building/PowerHourlyChart";
import { PowerZoneBillingTable } from "@/src/components/building/PowerZoneBillingTable";

interface ZonePowerTabProps {
  zoneId?: string;
}

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH = now.getMonth() + 1;

export function ZonePowerTab({ zoneId }: ZonePowerTabProps) {
  const zoneIdNum = zoneId !== undefined ? Number(zoneId) : NaN;
  const { data: powerZones } = usePowerZones();
  const hasPowerMeter = !Number.isNaN(zoneIdNum) && (powerZones ?? []).some((p) => p.zoneId === zoneIdNum);

  if (!hasPowerMeter) {
    return (
      <div className="bg-surface p-8 rounded-2xl border border-border shadow-[var(--shadow-card)]">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-6">
            <Zap className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">POWER 미터 미보유</h3>
          <p className="text-muted-foreground text-sm max-w-[300px]">
            본 구역에는 전력 미터가 설치되어 있지 않습니다. 지원 zone:
          </p>
          <p className="text-[10px] text-muted-foreground font-mono mt-2">
            {(powerZones ?? []).map((p) => p.zoneName).join(" · ")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PowerHourlyChart zoneId={zoneIdNum} />
      <PowerZoneBillingTable zoneId={zoneIdNum} year={CURRENT_YEAR} month={CURRENT_MONTH} />
    </div>
  );
}
