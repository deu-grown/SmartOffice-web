// G10 회의실 캘린더 탭 — 구역별 일자 슬롯 표시.
// ZoneSelect 공용 컴포넌트 재사용. 시간축 09:00~22:00 (1시간 단위). 예약은 startTime~endTime 범위 막대 렌더.
// readOnly=true 시 ZoneReservationTab(G5) 에서 재사용 — 행 클릭 트리거 비활성.
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { ZoneSelect, type ZoneSelectOption } from "@/src/components/common/ZoneSelect";
import { useZoneReservations } from "@/src/features/reservation/hooks";
import type {
  ReservationListItem,
  ReservationStatus,
} from "@/src/features/reservation/types";
import { useZones } from "@/src/features/zone/hooks";

const HOUR_START = 9;
const HOUR_END = 22;

// 상태별 슬롯 색상.
const STATUS_BG: Record<ReservationStatus, string> = {
  CONFIRMED: "bg-blue-100 border-blue-300 text-blue-700",
  CHECKED_IN: "bg-emerald-100 border-emerald-300 text-emerald-700",
  CANCELLED: "bg-gray-100 border-gray-200 text-gray-400 line-through",
  NO_SHOW: "bg-red-50 border-red-200 text-red-500",
};

interface ZoneReservationCalendarProps {
  /** read-only 모드일 때 행 클릭 비활성. ZoneReservationTab(G5) 재사용 시 true. */
  readOnly?: boolean;
  /** 외부에서 zoneId 강제 지정 (G5 ZoneReservationTab 진입 시). 없으면 자체 ZoneSelect 노출. */
  fixedZoneId?: number;
  onSelectReservation?: (id: number) => void;
}

export function ZoneReservationCalendar({
  readOnly = false,
  fixedZoneId,
  onSelectReservation,
}: ZoneReservationCalendarProps) {
  const zonesQuery = useZones();
  // 회의실은 zoneType=ROOM 으로 가정. AREA/FLOOR 도 예약 가능 가정 X — 백엔드 실시드 기준 ROOM 만 필터.
  const zoneOptions: ZoneSelectOption[] = useMemo(
    () =>
      (zonesQuery.data ?? [])
        .filter((z) => z.zoneType === "ROOM")
        .map((z) => ({ id: z.id, name: z.name })),
    [zonesQuery.data],
  );

  const [selectedZoneId, setSelectedZoneId] = useState<number | undefined>(fixedZoneId);
  const [date, setDate] = useState<string>(todayIsoDate());
  const effectiveZoneId = fixedZoneId ?? selectedZoneId;

  const { data, isLoading, isError, error } = useZoneReservations(effectiveZoneId, date);
  const items: ReservationListItem[] = data?.reservationList ?? [];

  const hours = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">캘린더</h2>
          <p className="text-sm text-gray-400">
            {effectiveZoneId ? "선택된 회의실의 일자별 예약을 표시합니다." : "회의실을 선택하세요."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!fixedZoneId && (
            <ZoneSelect
              options={zoneOptions}
              value={selectedZoneId}
              onChange={(id) => setSelectedZoneId(id)}
              placeholder="회의실 선택"
              triggerClassName="w-44 h-10 rounded-xl bg-gray-50 border-gray-100"
              emptyText="등록된 회의실이 없습니다."
            />
          )}
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44 h-10 rounded-xl bg-gray-50 border-gray-100"
          />
        </div>
      </header>

      {!effectiveZoneId ? (
        <p className="py-12 text-center text-gray-400">회의실을 먼저 선택해 주세요.</p>
      ) : isLoading ? (
        <div className="space-y-2 py-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="py-12 text-center text-sm font-bold text-red-500">
          구역 예약 현황을 불러오지 못했습니다: {error?.message ?? ""}
        </p>
      ) : (
        <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
          {hours.map((h) => {
            const overlapping = items.filter((r) => {
              const start = new Date(r.startTime).getHours();
              const end = new Date(r.endTime).getHours();
              return start <= h && h < end;
            });
            return (
              <div key={h} className="flex items-stretch min-h-[44px]">
                <div className="w-16 px-3 py-2 text-xs font-bold text-gray-400 bg-gray-50 flex items-center">
                  {String(h).padStart(2, "0")}:00
                </div>
                <div className="flex-1 flex flex-wrap gap-2 px-3 py-2">
                  {overlapping.length === 0 ? (
                    <span className="text-xs text-gray-300">예약 없음</span>
                  ) : (
                    overlapping.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() =>
                          !readOnly && onSelectReservation
                            ? onSelectReservation(r.id)
                            : undefined
                        }
                        disabled={readOnly}
                        className={`text-left text-xs font-medium px-3 py-1.5 rounded-xl border ${STATUS_BG[r.status]} ${readOnly ? "cursor-default" : "hover:opacity-90"}`}
                      >
                        <span className="font-bold">{r.userName}</span> ·{" "}
                        {formatRange(r.startTime, r.endTime)}
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400">
        총 {items.length} 건 · {date}
      </p>
    </div>
  );
}

function todayIsoDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatRange(startIso: string, endIso: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${fmt(s)}~${fmt(e)}`;
}
