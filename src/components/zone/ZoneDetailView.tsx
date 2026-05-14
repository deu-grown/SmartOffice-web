// 구역 상세 - 우측 패널 (헤더 + 4탭 셀렉터 + 탭 콘텐츠).
// 묶음 2 커밋 2.2 mock 제거: features/zone hook 기반.
// 4탭 구조: ZoneInfoTab(실제 zone DTO) / DeviceListTab(2.3) / ZoneReservationTab(G10) / ZonePowerTab(G7 4.5).
import { useState } from "react";
import { Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useZoneDetail, useZones } from "@/src/features/zone/hooks";

import { ZoneInfoTab } from "./tabs/ZoneInfoTab";
import { DeviceListTab } from "./tabs/DeviceListTab";
import { ZoneReservationTab } from "./tabs/ZoneReservationTab";
import { ZonePowerTab } from "./tabs/ZonePowerTab";

type ZoneTabId = "info" | "device" | "reservation" | "power";

interface ZoneDetailViewProps {
  selectedZoneId: number | null;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const TABS: { id: ZoneTabId; label: string }[] = [
  { id: "info", label: "기본 정보" },
  { id: "device", label: "장치 목록" },
  { id: "reservation", label: "예약" },
  { id: "power", label: "전력" },
];

export function ZoneDetailView({ selectedZoneId, onEditClick, onDeleteClick }: ZoneDetailViewProps) {
  const [activeTab, setActiveTab] = useState<ZoneTabId>("info");
  const detail = useZoneDetail(selectedZoneId ?? undefined);
  const zonesQuery = useZones();
  const parentZone =
    detail.data?.parentId !== undefined && detail.data?.parentId !== null
      ? zonesQuery.data?.find((z) => z.id === detail.data!.parentId)
      : undefined;

  if (selectedZoneId === null) {
    return (
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-gray-400 text-sm">좌측 그리드에서 구역을 선택해 주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="min-w-0">
            <h3 className="text-3xl font-bold text-gray-900 truncate">
              {detail.data?.name ?? "구역 상세"}
            </h3>
            <p className="text-base font-medium text-gray-400">
              {detail.data ? `#${detail.data.id}` : "—"}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEditClick}
              disabled={!detail.data}
              className="rounded-xl hover:bg-gray-100 h-12 w-12 transition-all active:scale-90 group"
              aria-label="구역 정보 수정"
            >
              <Settings className="w-6 h-6 text-gray-400 group-hover:text-black group-hover:rotate-90 transition-all duration-300" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDeleteClick}
              disabled={!detail.data}
              className="rounded-xl hover:bg-red-50 h-12 w-12 transition-all active:scale-90 group"
              aria-label="구역 삭제"
            >
              <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            </Button>
          </div>
        </div>

        <div className="flex bg-gray-50 p-1 rounded-2xl gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                activeTab === t.id ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === "info" && (
        <ZoneInfoTab zone={detail.data} parentZone={parentZone} isLoading={detail.isLoading} />
      )}
      {activeTab === "device" && <DeviceListTab zoneId={String(selectedZoneId)} />}
      {activeTab === "reservation" && <ZoneReservationTab zoneId={String(selectedZoneId)} />}
      {activeTab === "power" && <ZonePowerTab zoneId={String(selectedZoneId)} />}
    </div>
  );
}
