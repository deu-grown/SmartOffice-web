// 구역 상세 - 기본 정보 탭.
// 묶음 2 커밋 2.1 (빈 분할, mock 유지): 기존 ZoneManagement detail panel 통째 이식.
// 묶음 2 커밋 2.2 에서 mock 제거 후 zone DTO(id/name/zoneType/parentId/description/createdAt) 기반으로 재작성 예정.
import { Shield, Layout, Users, ToggleLeft, ToggleRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Room } from "../../../types";

interface ZoneInfoTabProps {
  selectedRoom: Room;
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

export function ZoneInfoTab({
  selectedRoom,
  permissionTypeTab,
  setPermissionTypeTab,
  onToggleGate,
  onTogglePermission,
  onSelectAllPermissions,
  onOpenAddPermissionModal,
  isAddingGroup,
  setIsAddingGroup,
  newGroupInput,
  setNewGroupInput,
  onAddGroupTag,
  onDeleteGroup,
}: ZoneInfoTabProps) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
      {/* 보안 게이트 토글 */}
      <div
        className={cn(
          "p-8 rounded-3xl flex items-center justify-between transition-all duration-300",
          selectedRoom.gateActive ? "bg-black text-white shadow-lg shadow-black/10" : "bg-gray-50 text-gray-900"
        )}
      >
        <div className="flex items-center gap-5">
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
              selectedRoom.gateActive ? "bg-white/10 text-white" : "bg-white text-gray-300 border border-gray-100"
            )}
          >
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-bold">보안 게이트 활성화</p>
            <p
              className={cn(
                "text-sm font-medium",
                selectedRoom.gateActive ? "text-gray-400" : "text-gray-400"
              )}
            >
              {selectedRoom.gateActive ? "현재 보안 가동 중" : "현재 보안 해제됨"}
            </p>
          </div>
        </div>
        <button
          onClick={() => onToggleGate(selectedRoom.id)}
          className="relative inline-flex h-10 w-18 items-center rounded-full transition-colors focus:outline-none"
        >
          {selectedRoom.gateActive ? (
            <ToggleRight className="w-14 h-14 text-white" />
          ) : (
            <ToggleLeft className="w-14 h-14 text-gray-300" />
          )}
        </button>
      </div>

      {/* 출입 권한 설정 */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            출입 권한 설정
          </h4>
          <button
            onClick={() => onSelectAllPermissions(selectedRoom.id)}
            className="text-sm font-bold text-gray-400 hover:text-black"
          >
            현재 탭 전체 허용
          </button>
        </div>

        <div className="flex bg-gray-50 p-1 rounded-2xl gap-1">
          {(["RANK", "DEPT", "STAFF"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setPermissionTypeTab(tab)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                permissionTypeTab === tab ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {tab === "RANK" ? "직급별" : tab === "DEPT" ? "부서별" : "직원별"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {selectedRoom.permissions
            .filter((p) => p.type === permissionTypeTab)
            .map((p) => (
              <button
                key={p.id}
                onClick={() => onTogglePermission(selectedRoom.id, p.id)}
                className={cn(
                  "p-5 rounded-2xl border-2 flex items-center justify-between transition-all text-left",
                  p.allowed ? "border-black bg-white" : "border-gray-100 bg-gray-50/50 opacity-60"
                )}
              >
                <div className="flex flex-col">
                  <span className="text-base font-bold text-gray-900">{p.name}</span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {p.type === "RANK" ? "직급 권한" : p.type === "DEPT" ? "부서 단위" : "개별 지정"}
                  </span>
                </div>
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    p.allowed ? "border-black bg-black scale-110" : "border-gray-300"
                  )}
                >
                  {p.allowed && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          <Button
            variant="outline"
            className="h-full border-dashed border-gray-200 rounded-2xl min-h-[72px] flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-black hover:border-gray-300 transition-all"
            onClick={onOpenAddPermissionModal}
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-bold">항목 추가</span>
          </Button>
        </div>
      </div>

      {/* 구역 그룹 관리 */}
      <div className="space-y-5">
        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Layout className="w-5 h-5 text-gray-400" />
          구역 그룹 관리
        </h4>
        <div className="flex flex-wrap gap-3">
          {selectedRoom.groups.map((group) => (
            <Badge
              key={group}
              className="h-9 bg-gray-100 text-gray-600 hover:bg-gray-200 border-none rounded-xl px-4 font-bold text-sm flex items-center gap-2 transition-all"
            >
              {group}
              <button
                type="button"
                className="inline-flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteGroup(selectedRoom.id, group);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Badge>
          ))}

          {isAddingGroup ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                className="h-9 w-28 rounded-xl text-sm font-bold px-4 border-gray-100 bg-gray-50 focus-visible:ring-black/5 shadow-sm"
                value={newGroupInput}
                onChange={(e) => setNewGroupInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onAddGroupTag(selectedRoom.id);
                  if (e.key === "Escape") setIsAddingGroup(false);
                }}
                onBlur={() => onAddGroupTag(selectedRoom.id)}
                placeholder="그룹 명칭"
              />
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingGroup(true)}
              className="rounded-xl border-dashed border-gray-200 text-gray-400 h-9 px-4 font-bold hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-all text-sm"
            >
              <Plus className="w-4 h-4 mr-1" /> 추가
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
