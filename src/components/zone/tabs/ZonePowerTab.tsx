// 구역 상세 - 전력 탭. 묶음 4 커밋 4.5: placeholder 제거 + 실제 차트/표 연결.
// POWER 미터 보유 zone (POWER_ZONES_TEMP) 만 활성. 외 zone 은 '미보유' 안내.
import { Zap } from "lucide-react";
import { POWER_ZONES_TEMP } from "@/src/features/power/constants";
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
  const hasPowerMeter = !Number.isNaN(zoneIdNum) && POWER_ZONES_TEMP.some((p) => p.zoneId === zoneIdNum);

  if (!hasPowerMeter) {
    return (
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Zap className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">POWER 미터 미보유</h3>
          <p className="text-gray-400 text-sm max-w-[300px]">
            본 구역에는 전력 미터가 설치되어 있지 않습니다. 지원 zone:
          </p>
          <p className="text-[10px] text-gray-400 font-mono mt-2">
            {POWER_ZONES_TEMP.map((p) => p.zoneName).join(" · ")}
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
