// 구역 상세 - 전력 탭.
// 마스터플랜 G7 (건물·환경·제어) 진입 시 features/power 확장 (hourly + zone-billing) 흡수 후 활성화 예정 (placeholder 단계).
import { Zap } from "lucide-react";

interface ZonePowerTabProps {
  zoneId?: string;
}

export function ZonePowerTab(_props: ZonePowerTabProps) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Zap className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">전력 사용량</h3>
        <p className="text-gray-400 text-sm max-w-[260px]">
          본 구역의 시간별 전력 사용량과 월 요금 내역을 표시합니다. (플랜 3-2 G7 커밋 4.5 에서 활성화)
        </p>
      </div>
    </div>
  );
}
