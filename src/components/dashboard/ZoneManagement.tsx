import React, { useState } from "react";
import { 
  Layout, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Package, 
  Users, 
  Plus, 
  Trash2, 
  Settings,
  ChevronRight,
  Map as MapIcon,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Room, PermissionSetting } from "../../types";

interface ZoneManagementProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setHasUnsavedChanges: (val: boolean) => void;
  onSave?: () => void;
}

export function ZoneManagement({ rooms, setRooms, setHasUnsavedChanges, onSave }: ZoneManagementProps) {
  const [selectedFloor, setSelectedFloor] = useState("3F");
  const floorRooms = rooms.filter(r => r.floor === selectedFloor);
  
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

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || floorRooms[0] || rooms[0];

  React.useEffect(() => {
    const currentFloorRooms = rooms.filter(r => r.floor === selectedFloor);
    if (currentFloorRooms.length > 0) {
      setSelectedRoomId(currentFloorRooms[0].id);
    }
  }, [selectedFloor, rooms]);

  const toggleGate = (id: string) => {
    setPendingGateToggle(id);
    setShowSaveConfirm(true);
  };

  const confirmGateToggle = () => {
    if (!pendingGateToggle) return;
    setRooms(prevRooms => prevRooms.map(room => 
      room.id === pendingGateToggle ? { ...room, gateActive: !room.gateActive } : room
    ));
    setHasUnsavedChanges(true);
    toast.success("보안 게이트 상태가 성공적으로 변경되었습니다.");
    setShowSaveConfirm(false);
    setPendingGateToggle(null);
  };

  const togglePermission = (roomId: string, permissionId: string) => {
    setRooms(prevRooms => prevRooms.map(room => 
      room.id === roomId 
        ? { 
            ...room, 
            permissions: room.permissions.map(p => 
              p.id === permissionId ? { ...p, allowed: !p.allowed } : p
            ) 
          } 
        : room
    ));
    setHasUnsavedChanges(true);
  };

  const selectAllPermissions = (roomId: string) => {
    setRooms(prevRooms => prevRooms.map(room => 
      room.id === roomId 
        ? { 
            ...room, 
            permissions: room.permissions.map(p => 
              p.type === permissionTypeTab ? { ...p, allowed: true } : p
            ) 
          } 
        : room
    ));
    setHasUnsavedChanges(true);
  };

  const handleDeleteRoom = (id: string) => {
    if (rooms.length <= 1) return;
    const newRooms = rooms.filter(r => r.id !== id);
    setRooms(newRooms);
    setHasUnsavedChanges(true);
    if (selectedRoomId === id) {
      setSelectedRoomId(newRooms[0].id);
    }
  };

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
    setRooms(prevRooms => prevRooms.map(room => 
      room.id === selectedRoomId 
        ? { ...room, name: editName, type: editType } 
        : room
    ));
    setLocalHasUnsavedChanges(false);
    setHasUnsavedChanges(false); // Update parent
    if (onSave) onSave();
    setIsSettingsOpen(false);
    toast.success("구역 설정이 저장되었습니다.");
  };

  const confirmExitWithoutSave = () => {
    setLocalHasUnsavedChanges(false);
    setShowExitConfirm(false);
    setIsSettingsOpen(false);
  };

  const handleAddGate = () => {
    const newId = (Date.now()).toString();
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
        { id: `rank-${Date.now()}-4`, name: "사원", type: "RANK", allowed: false }
      ],
      groups: ["미지정"]
    };
    setRooms([...rooms, newRoom]);
    setHasUnsavedChanges(true);
    setSelectedRoomId(newId);
    setIsAddGateOpen(false);
    setNewName("");
    setNewType("일반구역");
  };

  const handleDeleteGroup = (roomId: string, groupToDelete: string) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, groups: room.groups.filter(g => g !== groupToDelete) }
        : room
    ));
    setHasUnsavedChanges(true);
  };

  const handleAddGroupTag = (roomId: string) => {
    if (!newGroupInput.trim()) {
      setIsAddingGroup(false);
      return;
    }
    
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        if (room.groups.includes(newGroupInput.trim())) return room;
        return { ...room, groups: [...room.groups, newGroupInput.trim()] };
      }
      return room;
    }));
    setHasUnsavedChanges(true);
    
    setNewGroupInput("");
    setIsAddingGroup(false);
  };

  const masterData = {
    RANK: ["사장", "전무", "상무", "이사", "부장", "과장", "대리", "사원", "인턴", "외부인"],
    DEPT: ["경영지원팀", "인사팀", "재무팀", "IT본부", "디자인팀", "마케팅팀", "운영팀", "보안팀", "연구소"],
    STAFF: ["김호탈", "이대표", "홍길동", "성춘향", "이몽룡", "장희빈", "김철수", "박영희"]
  };

  const handleAddPermission = (name: string) => {
    setRooms(prev => prev.map(room => {
      if (room.id === selectedRoomId) {
        // Only add if not already there
        if (room.permissions.some(p => p.name === name && p.type === permissionTypeTab)) {
          toast.error("이미 목록에 존재합니다.");
          return room;
        }
        
        const newPermission: PermissionSetting = {
          id: `${permissionTypeTab.toLowerCase()}-${Date.now()}`,
          name,
          type: permissionTypeTab,
          allowed: false
        };
        
        return {
          ...room,
          permissions: [...room.permissions, newPermission]
        };
      }
      return room;
    }));
    setHasUnsavedChanges(true);
    setIsAddPermissionOpen(false);
    toast.success(`${name} 항목이 추가되었습니다.`);
  };

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Add Permission Item Modal */}
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
              {masterData[permissionTypeTab].map(item => {
                const isAlreadyPresent = selectedRoom.permissions.some(p => p.name === item && p.type === permissionTypeTab);
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

      {/* Add Gate Modal */}
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

      {/* Settings Modal Overlay */}
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

      {/* Gate Toggle Confirmation */}
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
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">보안 게이트 상태를<br />변경하시겠습니까?</h2>
              <p className="text-gray-500 font-medium">상태 변경 시 출입 기록에 즉시 반영됩니다</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => { setShowSaveConfirm(false); setPendingGateToggle(null); }}
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

      {/* Exit Settings Confirmation */}
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
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">저장하지 않은<br />변경사항이 있습니다</h2>
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

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">구역 관리</h1>
          <p className="text-gray-500 text-lg font-medium">건물 내 구역별 보안 설정 및 자산을 관리합니다</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedFloor} onValueChange={setSelectedFloor}>
            <SelectTrigger className="w-[120px] bg-white border-gray-100 rounded-xl h-12 font-bold">
              <SelectValue placeholder="층 선택" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100">
              <SelectItem value="5F">5F</SelectItem>
              <SelectItem value="4F">4F</SelectItem>
              <SelectItem value="3F">3F</SelectItem>
              <SelectItem value="2F">2F</SelectItem>
              <SelectItem value="1F">1F</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => setIsAddGateOpen(true)}
            className="bg-black text-white hover:bg-black/90 rounded-xl h-12 px-6 font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            보안 게이트 추가
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Floor Map Visualization */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-gray-400" />
                {selectedFloor} 평면 구조
              </h3>
              <div className="flex gap-4 text-xs font-bold text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-black"></div>
                  <span>보안구역</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-100"></div>
                  <span>일반구역</span>
                </div>
              </div>
            </div>

            {/* Mock Floor Plan Layout */}
            <div className="flex-1 grid grid-cols-2 gap-4 relative">
              {floorRooms.map((room) => (
                <div key={room.id} className="relative group">
                  <button
                    onClick={() => setSelectedRoomId(room.id)}
                    className={cn(
                      "w-full h-full relative p-6 rounded-2xl border-2 transition-all text-left flex flex-col justify-between",
                      selectedRoomId === room.id 
                        ? "border-black bg-gray-50 shadow-md" 
                        : "border-gray-50 bg-white hover:border-gray-200"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                          room.type === "보안구역" ? "bg-black text-white" : "bg-gray-100 text-gray-400"
                        )}>
                          {room.type}
                        </span>
                        {room.gateActive ? (
                          <ShieldCheck className="w-4 h-4 text-green-500" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">{room.name}</h4>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1">
                      {room.groups.map(g => (
                        <span key={g} className="text-[10px] font-bold text-gray-400">#{g}</span>
                      ))}
                    </div>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id); }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
            </div>
          </div>
        </div>

        {/* Zone Details Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{selectedRoom.name} 상세 설정</h3>
                <p className="text-base font-medium text-gray-400">{selectedFloor} • {selectedRoom.type}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSettingsClick}
                className="rounded-xl hover:bg-gray-100 h-12 w-12 transition-all active:scale-90 group"
              >
                <Settings className="w-6 h-6 text-gray-400 group-hover:text-black group-hover:rotate-90 transition-all duration-300" />
              </Button>
            </div>

            {/* Security Gate Toggle */}
            <div className={cn(
              "p-8 rounded-3xl flex items-center justify-between transition-all duration-300",
              selectedRoom.gateActive ? "bg-black text-white shadow-lg shadow-black/10" : "bg-gray-50 text-gray-900"
            )}>
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                  selectedRoom.gateActive ? "bg-white/10 text-white" : "bg-white text-gray-300 border border-gray-100"
                )}>
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-bold">보안 게이트 활성화</p>
                  <p className={cn(
                    "text-sm font-medium",
                    selectedRoom.gateActive ? "text-gray-400" : "text-gray-400"
                  )}>
                    {selectedRoom.gateActive ? "현재 보안 가동 중" : "현재 보안 해제됨"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => toggleGate(selectedRoom.id)}
                className="relative inline-flex h-10 w-18 items-center rounded-full transition-colors focus:outline-none"
              >
                {selectedRoom.gateActive ? (
                  <ToggleRight className="w-14 h-14 text-white" />
                ) : (
                  <ToggleLeft className="w-14 h-14 text-gray-300" />
                )}
              </button>
            </div>

            {/* Access Permissions */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  출입 권한 설정
                </h4>
                <button 
                  onClick={() => selectAllPermissions(selectedRoom.id)}
                  className="text-sm font-bold text-gray-400 hover:text-black"
                >
                  현재 탭 전체 허용
                </button>
              </div>
              
              {/* Permission Tabs */}
              <div className="flex bg-gray-50 p-1 rounded-2xl gap-1">
                {(["RANK", "DEPT", "STAFF"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPermissionTypeTab(tab)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                      permissionTypeTab === tab 
                        ? "bg-white text-black shadow-sm" 
                        : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {tab === "RANK" ? "직급별" : tab === "DEPT" ? "부서별" : "직원별"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedRoom.permissions
                  .filter(p => p.type === permissionTypeTab)
                  .map((p) => (
                    <button 
                      key={p.id}
                      onClick={() => togglePermission(selectedRoom.id, p.id)}
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
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        p.allowed ? "border-black bg-black scale-110" : "border-gray-300"
                      )}>
                        {p.allowed && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                  <Button 
                    variant="outline" 
                    className="h-full border-dashed border-gray-200 rounded-2xl min-h-[72px] flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-black hover:border-gray-300 transition-all"
                    onClick={() => setIsAddPermissionOpen(true)}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[10px] font-bold">항목 추가</span>
                  </Button>
              </div>
            </div>

            {/* Group Management */}
            <div className="space-y-5">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Layout className="w-5 h-5 text-gray-400" />
                구역 그룹 관리
              </h4>
              <div className="flex flex-wrap gap-3">
                {selectedRoom.groups.map(group => (
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
                        handleDeleteGroup(selectedRoom.id, group);
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
                        if (e.key === 'Enter') handleAddGroupTag(selectedRoom.id);
                        if (e.key === 'Escape') setIsAddingGroup(false);
                      }}
                      onBlur={() => handleAddGroupTag(selectedRoom.id)}
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
        </div>
      </div>
    </div>
  );
}
