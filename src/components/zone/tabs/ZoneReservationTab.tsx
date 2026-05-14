// 구역 상세 - 예약 탭. 플랜 3-4 묶음 3.2 에서 placeholder → 활성화 (G10 캘린더 wrap).
// 본 탭은 read-only — 수정/취소 액션은 회의실 관리 페이지(/meeting-rooms) 에서만 가능.
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

import { ZoneReservationCalendar } from "@/src/components/meetingroom/ZoneReservationCalendar";
import { ROUTES } from "@/src/routes/paths";

interface ZoneReservationTabProps {
  zoneId?: string;
}

export function ZoneReservationTab({ zoneId }: ZoneReservationTabProps) {
  const numericZoneId = zoneId ? Number(zoneId) : undefined;

  if (!numericZoneId || Number.isNaN(numericZoneId)) {
    return (
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-center text-gray-400">
        구역을 선택하면 예약 현황이 표시됩니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Link
          to={ROUTES.MEETING_ROOMS}
          className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-black px-3 py-2 rounded-xl hover:bg-gray-50"
        >
          회의실 관리 페이지에서 편집
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
      <ZoneReservationCalendar readOnly fixedZoneId={numericZoneId} />
    </div>
  );
}
