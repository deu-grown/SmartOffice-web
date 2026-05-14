// 구역 관리 페이지 컨테이너.
// 묶음 2 커밋 2.1 (빈 분할, mock 유지): 800줄 단일 파일 → ZoneListView + ZoneDetailView + 4탭 + 5 모달 구조로 분할.
// 묶음 2 커밋 2.2 에서 features/zone 흡수 후 mock 제거 + props 인터페이스 갱신 예정.
import React, { useState, useEffect } from "react";
import { Shield, ShieldAlert, Layout, Map as MapIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { toast } from "sonner";

import { Room, PermissionSetting } from "../../types";
import { ZoneListView } from "../zone/ZoneListView";
import { ZoneDetailView } from "../zone/ZoneDetailView";

interface ZoneManagementProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setHasUnsavedChanges: (val: boolean) => void;
  onSave?: () => void;
}

const PERMISSION_MASTER_DATA = {
  RANK: ["사장", "전무", "상무", "이사", "부장", "과장", "대리", "사원", "인턴", "외부인"],
  DEPT: ["경영지원팀", "인사팀", "재무팀", "IT본부", "디자인팀", "마케팅팀", "운영팀", "보안팀", "연구소"],
  STAFF: ["김호탈", "이대표", "홍길동", "성춘향", "이몽룡", "장희빈", "김철수", "박영희"],
};

export function ZoneManagement({ rooms, setRooms, setHasUnsavedChanges, onSave }: ZoneManagementProps) {
  const [selectedFloor, setSelectedFloor] = useState("3F");
  const floorRooms = rooms.filter((r) => r.floor === selectedFloor);

  const [selectedRoomId, setSelectedRoomId] = useState<string>(floorRooms[0]?.id || "");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddGateOpen, setIsAddGateOpen] = useState(false);

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingGateToggle, setPendingGateToggle] = useState<string | null>(null);

  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupInput, setNewGroupInput] = useState("");
  const [permissionTypeTab, setPermissionTypeTab] = useState<"RANK" | "STAFF" | "DEPT">("RANK");
  const [isAddPermissionOpen, setIsAddPermissionOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("일반구역");

  const [localHasUnsavedChanges, setLocalHasUnsavedChanges] = useState(false);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || floorRooms[0] || rooms[0];

  useEffect(() => {
    const currentFloorRooms = rooms.filter((r) => r.floor === selectedFloor);
    if (currentFloorRooms.length > 0) {
      setSelectedRoomId(currentFloorRooms[0].id);
    }
  }, [selectedFloor, rooms]);

  // ── 게이트 토글 ────────────────────────────────────────────────
  const toggleGate = (id: string) => {
    setPendingGateToggle(id);
    setShowSaveConfirm(true);
  };

  const confirmGateToggle = () => {
    if (!pendingGateToggle) return;
    setRooms((prev) => prev.map((r) => (r.id === pendingGateToggle ? { ...r, gateActive: !r.gateActive } : r)));
    setHasUnsavedChanges(true);
    toast.success("보안 게이트 상태가 성공적으로 변경되었습니다.");
    setShowSaveConfirm(false);
    setPendingGateToggle(null);
  };

  // ── 권한 토글 ────────────────────────────────────────────────
  const togglePermission = (roomId: string, permissionId: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, permissions: r.permissions.map((p) => (p.id === permissionId ? { ...p, allowed: !p.allowed } : p)) }
          : r
      )
    );
    setHasUnsavedChanges(true);
  };

  const selectAllPermissions = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, permissions: r.permissions.map((p) => (p.type === permissionTypeTab ? { ...p, allowed: true } : p)) }
          : r
      )
    );
    setHasUnsavedChanges(true);
  };

  // ── 구역 삭제 ────────────────────────────────────────────────
  const handleDeleteRoom = (id: string) => {
    if (rooms.length <= 1) return;
    const newRooms = rooms.filter((r) => r.id !== id);
    setRooms(newRooms);
    setHasUnsavedChanges(true);
    if (selectedRoomId === id) {
      setSelectedRoomId(newRooms[0].id);
    }
  };

  // ── 설정 모달 ────────────────────────────────────────────────
  const handleSettingsClick = () => {
    setEditName(selectedRoom.name);
    setEditType(selectedRoom.type);
    setLocalHasUnsavedChanges(false);
    setIsSettingsOpen(true);
  };

  const handleSettingsFieldChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setLocalHasUnsavedChanges(true);
  };

  const handleCloseSettings = () => {
    if (localHasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      setIsSettingsOpen(false);
    }
  };

  const handleSaveSettings = () => {
    setRooms((prev) => prev.map((r) => (r.id === selectedRoomId ? { ...r, name: editName, type: editType } : r)));
    setLocalHasUnsavedChanges(false);
    setHasUnsavedChanges(false);
    if (onSave) onSave();
    setIsSettingsOpen(false);
    setShowExitConfirm(false);
    toast.success("구역 설정이 저장되었습니다.");
  };

  const confirmExitWithoutSave = () => {
    setLocalHasUnsavedChanges(false);
    setShowExitConfirm(false);
    setIsSettingsOpen(false);
  };

  // ── 게이트 추가 ────────────────────────────────────────────────
  const handleAddGate = () => {
    const newId = Date.now().toString();
    const newRoom: Room = {
      id: newId,
      name: newName || `신규 구역 ${rooms.length + 1}`,
      type: newType,
      gateActive: false,
      floor: selectedFloor,
      permissions: [
        { id: `rank-${Date.now()}-1`, name: "부장", type: "RANK", allowed: false },
        { id: `rank-${Date.now()}-2`, name: "과장", type: "RANK", allowed: false },
        { id: `rank-${Date.now()}-3`, name: "대리", type: "RANK", allowed: false },
        { id: `rank-${Date.now()}-4`, name: "사원", type: "RANK", allowed: false },
      ],
      groups: ["미지정"],
    };
    setRooms([...rooms, newRoom]);
    setHasUnsavedChanges(true);
    setSelectedRoomId(newId);
    setIsAddGateOpen(false);
    setNewName("");
    setNewType("일반구역");
  };

  // ── 그룹 ────────────────────────────────────────────────
  const handleDeleteGroup = (roomId: string, groupToDelete: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, groups: r.groups.filter((g) => g !== groupToDelete) } : r))
    );
    setHasUnsavedChanges(true);
  };

  const handleAddGroupTag = (roomId: string) => {
    if (!newGroupInput.trim()) {
      setIsAddingGroup(false);
      return;
    }
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          if (r.groups.includes(newGroupInput.trim())) return r;
          return { ...r, groups: [...r.groups, newGroupInput.trim()] };
        }
        return r;
      })
    );
    setHasUnsavedChanges(true);
    setNewGroupInput("");
    setIsAddingGroup(false);
  };

  // ── 권한 항목 추가 ────────────────────────────────────────────────
  const handleAddPermission = (name: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === selectedRoomId) {
          if (r.permissions.some((p) => p.name === name && p.type === permissionTypeTab)) {
            toast.error("이미 목록에 존재합니다.");
            return r;
          }
          const newPermission: PermissionSetting = {
            id: `${permissionTypeTab.toLowerCase()}-${Date.now()}`,
            name,
            type: permissionTypeTab,
            allowed: false,
          };
          return { ...r, permissions: [...r.permissions, newPermission] };
        }
        return r;
      })
    );
    setHasUnsavedChanges(true);
    setIsAddPermissionOpen(false);
    toast.success(`${name} 항목이 추가되었습니다.`);
  };

  return (
    <div className="space-y-8 pb-12 relative">
      {/* 권한 항목 추가 모달 */}
      {isAddPermissionOpen && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                {permissionTypeTab === "RANK" ? "직급" : permissionTypeTab === "DEPT" ? "부서" : "직원"} 추가
              </h2>
              <p className="text-gray-500 font-medium">관리 대상 목록에서 선택하여 추가할 수 있습니다</p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1">
              {PERMISSION_MASTER_DATA[permissionTypeTab].map((item) => {
                const isAlreadyPresent = selectedRoom.permissions.some(
                  (p) => p.name === item && p.type === permissionTypeTab
                );
                return (
                  <button
                    key={item}
                    disabled={isAlreadyPresent}
                    onClick={() => handleAddPermission(item)}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all font-bold text-sm",
                      isAlreadyPresent
                        ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                        : "border-gray-50 hover:border-black bg-white"
                    )}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsAddPermissionOpen(false)}
                className="flex-1 h-14 rounded-2xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              >
                닫기
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 게이트 추가 모달 */}
      {isAddGateOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">보안 게이트 추가</h2>
              <p className="text-gray-500 font-medium">{selectedFloor}에 신규 보안 게이트를 설치합니다</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">구역 명칭</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50 px-6 text-lg font-bold"
                  placeholder="예: 서버실, 회의실 B"
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-400 ml-1">구역 유형</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "보안구역", icon: Shield, color: "bg-black text-white" },
                    { id: "사무공간", icon: Layout, color: "bg-blue-50 text-blue-600" },
                    { id: "공용공간", icon: Users, color: "bg-orange-50 text-orange-600" },
                    { id: "일반구역", icon: MapIcon, color: "bg-gray-100 text-gray-600" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setNewType(type.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                        newType === type.id
                          ? "border-black bg-white shadow-sm"
                          : "border-gray-50 bg-gray-50/50 hover:border-gray-100"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", type.color)}>
                        <type.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm">{type.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setIsAddGateOpen(false)}
                className="flex-1 h-14 rounded-2xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              >
                취소
              </Button>
              <Button
                onClick={handleAddGate}
                className="flex-1 h-14 rounded-2xl font-bold bg-black text-white hover:bg-black/90"
              >
                게이트 추가
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 구역 설정 수정 모달 */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">구역 설정 수정</h2>
              <p className="text-gray-500 font-medium">구역의 기본 정보를 변경합니다</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">구역 명칭</label>
                <Input
                  value={editName}
                  onChange={(e) => handleSettingsFieldChange(setEditName, e.target.value)}
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50 px-6 text-lg font-bold"
                  placeholder="구역 이름을 입력하세요"
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-400 ml-1">구역 유형</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "보안구역", icon: Shield, color: "bg-black text-white" },
                    { id: "사무공간", icon: Layout, color: "bg-blue-50 text-blue-600" },
                    { id: "공용공간", icon: Users, color: "bg-orange-50 text-orange-600" },
                    { id: "일반구역", icon: MapIcon, color: "bg-gray-100 text-gray-600" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleSettingsFieldChange(setEditType, type.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                        editType === type.id
                          ? "border-black bg-white shadow-sm"
                          : "border-gray-50 bg-gray-50/50 hover:border-gray-100"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", type.color)}>
                        <type.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm">{type.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={handleCloseSettings}
                className="flex-1 h-14 rounded-2xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              >
                취소
              </Button>
              <Button
                onClick={handleSaveSettings}
                className="flex-1 h-14 rounded-2xl font-bold bg-black text-white hover:bg-black/90"
              >
                저장하기
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 게이트 토글 확인 모달 */}
      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl space-y-8 text-center"
          >
            <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center mx-auto">
              <Shield className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                보안 게이트 상태를<br />변경하시겠습니까?
              </h2>
              <p className="text-gray-500 font-medium">상태 변경 시 출입 기록에 즉시 반영됩니다</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowSaveConfirm(false);
                  setPendingGateToggle(null);
                }}
                className="flex-1 h-14 rounded-2xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              >
                취소
              </Button>
              <Button
                onClick={confirmGateToggle}
                className="flex-1 h-14 rounded-2xl font-bold bg-black text-white hover:bg-black/90"
              >
                변경하기
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 설정 변경 저장 확인 모달 */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl space-y-8 text-center"
          >
            <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                저장하지 않은<br />변경사항이 있습니다
              </h2>
              <p className="text-gray-500 font-medium">저장하지 않고 나가시면 수정사항이 사라집니다</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSaveSettings}
                className="w-full h-14 rounded-2xl font-bold bg-black text-white hover:bg-black/90"
              >
                변경사항 저장하고 나가기
              </Button>
              <Button
                variant="ghost"
                onClick={confirmExitWithoutSave}
                className="w-full h-14 rounded-2xl font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                저장하지 않고 나가기
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowExitConfirm(false)}
                className="w-full h-14 rounded-2xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              >
                계속 수정하기
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 본문: ZoneListView (좌측 평면도) + ZoneDetailView (우측 상세 4탭) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <ZoneListView
            selectedFloor={selectedFloor}
            setSelectedFloor={setSelectedFloor}
            floorRooms={floorRooms}
            selectedRoomId={selectedRoomId}
            setSelectedRoomId={setSelectedRoomId}
            onAddGateClick={() => setIsAddGateOpen(true)}
            onDeleteRoom={handleDeleteRoom}
          />
        </div>
        <div className="lg:col-span-5 space-y-6">
          {selectedRoom && (
            <ZoneDetailView
              selectedRoom={selectedRoom}
              selectedFloor={selectedFloor}
              onSettingsClick={handleSettingsClick}
              permissionTypeTab={permissionTypeTab}
              setPermissionTypeTab={setPermissionTypeTab}
              onToggleGate={toggleGate}
              onTogglePermission={togglePermission}
              onSelectAllPermissions={selectAllPermissions}
              onOpenAddPermissionModal={() => setIsAddPermissionOpen(true)}
              isAddingGroup={isAddingGroup}
              setIsAddingGroup={setIsAddingGroup}
              newGroupInput={newGroupInput}
              setNewGroupInput={setNewGroupInput}
              onAddGroupTag={handleAddGroupTag}
              onDeleteGroup={handleDeleteGroup}
            />
          )}
        </div>
      </div>
    </div>
  );
}
