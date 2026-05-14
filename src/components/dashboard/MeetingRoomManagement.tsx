// G10 회의실 관리 페이지 컨테이너 (마스터플랜 5절 마지막 도메인 플랜).
// 리스트 + 캘린더 2탭 — ADMIN 전체 운영 + 구역별 일자 슬롯.
// AdminRoute 는 main.tsx /* 단일 wrap 으로 일괄 적용.
import { useState } from "react";
import { ListChecks, CalendarRange } from "lucide-react";

import { cn } from "@/lib/utils";

import { ReservationDetailDrawer } from "@/src/components/meetingroom/ReservationDetailDrawer";
import { ReservationListTable } from "@/src/components/meetingroom/ReservationListTable";
import { ZoneReservationCalendar } from "@/src/components/meetingroom/ZoneReservationCalendar";

type ViewMode = "list" | "calendar";

export function MeetingRoomManagement() {
  const [view, setView] = useState<ViewMode>("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">회의실 관리</h1>
        <p className="text-gray-500 text-lg font-medium">
          예약 현황을 운영하고 회의실별 슬롯을 관리합니다.
        </p>
      </header>

      <div className="flex items-center gap-2 border-b border-gray-100">
        <ViewTab active={view === "list"} onClick={() => setView("list")} icon={<ListChecks className="w-4 h-4" />}>
          예약 목록
        </ViewTab>
        <ViewTab
          active={view === "calendar"}
          onClick={() => setView("calendar")}
          icon={<CalendarRange className="w-4 h-4" />}
        >
          캘린더
        </ViewTab>
      </div>

      {view === "list" ? (
        <ReservationListTable onSelect={(id) => setSelectedId(id)} />
      ) : (
        <ZoneReservationCalendar onSelectReservation={(id) => setSelectedId(id)} />
      )}

      <ReservationDetailDrawer
        reservationId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

function ViewTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-5 py-3 text-sm font-bold transition-colors border-b-2 flex items-center gap-2",
        active
          ? "border-black text-black"
          : "border-transparent text-gray-400 hover:text-gray-700",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
