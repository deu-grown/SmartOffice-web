// 구역 상세 - 예약 탭.
// 마스터플랜 G10 (회의실 신규) 진입 시 features/reservation 흡수 후 활성화 예정 (placeholder 단계).
import { CalendarDays } from "lucide-react";

interface ZoneReservationTabProps {
  zoneId?: string;
}

export function ZoneReservationTab(_props: ZoneReservationTabProps) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <CalendarDays className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">예약 현황</h3>
        <p className="text-gray-400 text-sm max-w-[260px]">
          본 구역의 예약 일정을 표시합니다. (플랜 3-4 G10 회의실 진입 시 활성화)
        </p>
      </div>
    </div>
  );
}
