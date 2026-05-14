// 구역 상세 - 우측 패널 (헤더 + 4탭 셀렉터 + 탭 콘텐츠).
// 묶음 2 커밋 2.1 ZoneManagement 분할 (빈 분할, mock 유지).
// 4탭 구조: ZoneInfoTab / DeviceListTab(2.3) / ZoneReservationTab(G10) / ZonePowerTab(G7 4.5).
import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Room } from "../../types";

import { ZoneInfoTab } from "./tabs/ZoneInfoTab";
import { DeviceListTab } from "./tabs/DeviceListTab";
import { ZoneReservationTab } from "./tabs/ZoneReservationTab";
import { ZonePowerTab } from "./tabs/ZonePowerTab";

type ZoneTabId = "info" | "device" | "reservation" | "power";

interface ZoneDetailViewProps {
  selectedRoom: Room;
  selectedFloor: string;
  onSettingsClick: () => void;
  permissionTypeTab: "RANK" | "STAFF" | "DEPT";
  setPermissionTypeTab: (t: "RANK" | "STAFF" | "DEPT") => void;
  onToggleGate: (id: string) => void;
  onTogglePermission: (roomId: string, permissionId: string) => void;
  onSelectAllPermissions: (roomId: string) => void;
  onOpenAddPermissionModal: () => void;
  isAddingGroup: boolean;
  setIsAddingGroup: (v: boolean) => void;
  newGroupInput: string;
  setNewGroupInput: (v: string) => void;
  onAddGroupTag: (roomId: string) => void;
  onDeleteGroup: (roomId: string, group: string) => void;
}

const TABS: { id: ZoneTabId; label: string }[] = [
  { id: "info", label: "기본 정보" },
  { id: "device", label: "장치 목록" },
  { id: "reservation", label: "예약" },
  { id: "power", label: "전력" },
];

export function ZoneDetailView(props: ZoneDetailViewProps) {
  const { selectedRoom, selectedFloor, onSettingsClick } = props;
  const [activeTab, setActiveTab] = useState<ZoneTabId>("info");

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold text-gray-900">{selectedRoom.name} 상세 설정</h3>
            <p className="text-base font-medium text-gray-400">
              {selectedFloor} • {selectedRoom.type}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="rounded-xl hover:bg-gray-100 h-12 w-12 transition-all active:scale-90 group"
          >
            <Settings className="w-6 h-6 text-gray-400 group-hover:text-black group-hover:rotate-90 transition-all duration-300" />
          </Button>
        </div>

        {/* 탭 셀렉터 */}
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
        <ZoneInfoTab
          selectedRoom={selectedRoom}
          permissionTypeTab={props.permissionTypeTab}
          setPermissionTypeTab={props.setPermissionTypeTab}
          onToggleGate={props.onToggleGate}
          onTogglePermission={props.onTogglePermission}
          onSelectAllPermissions={props.onSelectAllPermissions}
          onOpenAddPermissionModal={props.onOpenAddPermissionModal}
          isAddingGroup={props.isAddingGroup}
          setIsAddingGroup={props.setIsAddingGroup}
          newGroupInput={props.newGroupInput}
          setNewGroupInput={props.setNewGroupInput}
          onAddGroupTag={props.onAddGroupTag}
          onDeleteGroup={props.onDeleteGroup}
        />
      )}
      {activeTab === "device" && <DeviceListTab zoneId={selectedRoom.id} />}
      {activeTab === "reservation" && <ZoneReservationTab zoneId={selectedRoom.id} />}
      {activeTab === "power" && <ZonePowerTab zoneId={selectedRoom.id} />}
    </div>
  );
}
