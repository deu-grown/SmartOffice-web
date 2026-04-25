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

interface Room {
  id: string;
  name: string;
  type: string;
  gateActive: boolean;
  inventory: { name: string; count: number; exportAllowed: boolean }[];
  permissions: { rank: string; allowed: boolean }[];
  groups: string[];
}

const initialRooms: Room[] = [
  { 
    id: "1", 
    name: "서버실", 
    type: "보안구역", 
    gateActive: true,
    inventory: [
      { name: "메인 서버랙", count: 4, exportAllowed: false },
      { name: "백업 스토리지", count: 2, exportAllowed: false }
    ],
    permissions: [
      { rank: "부장", allowed: true },
      { rank: "과장", allowed: true },
      { rank: "대리", allowed: false },
      { rank: "사원", allowed: false }
    ],
    groups: ["IT본부", "보안팀"]
  },
  { 
    id: "2", 
    name: "개발 1팀", 
    type: "사무공간", 
    gateActive: true,
    inventory: [
      { name: "테스트용 단말기", count: 15, exportAllowed: true },
      { name: "워크스테이션", count: 20, exportAllowed: false }
    ],
    permissions: [
      { rank: "부장", allowed: true },
      { rank: "과장", allowed: true },
      { rank: "대리", allowed: true },
      { rank: "사원", allowed: true }
    ],
    groups: ["개발본부"]
  },
  { 
    id: "3", 
    name: "임원실", 
    type: "보안구역", 
    gateActive: true,
    inventory: [
      { name: "금고", count: 1, exportAllowed: false }
    ],
    permissions: [
      { rank: "부장", allowed: true },
      { rank: "과장", allowed: false },
      { rank: "대리", allowed: false },
      { rank: "사원", allowed: false }
    ],
    groups: ["경영지원"]
  },
  { 
    id: "4", 
    name: "회의실 A", 
    type: "공용공간", 
    gateActive: false,
    inventory: [
      { name: "프로젝터", count: 1, exportAllowed: true }
    ],
    permissions: [
      { rank: "부장", allowed: true },
      { rank: "과장", allowed: true },
      { rank: "대리", allowed: true },
      { rank: "사원", allowed: true }
    ],
    groups: ["전체"]
  }
];

export function ZoneManagement() {
  const [selectedRoomId, setSelectedRoomId] = useState<string>("1");
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [selectedFloor, setSelectedFloor] = useState("3F");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];

  const toggleGate = (id: string) => {
    setRooms(prevRooms => prevRooms.map(room => 
      room.id === id ? { ...room, gateActive: !room.gateActive } : room
    ));
  };

  const togglePermission = (roomId: string, rank: string) => {
    setRooms(prevRooms => prevRooms.map(room => 
      room.id === roomId 
        ? { 
            ...room, 
            permissions: room.permissions.map(p => 
              p.rank === rank ? { ...p, allowed: !p.allowed } : p
            ) 
          } 
        : room
    ));
  };

  const selectAllPermissions = (roomId: string) => {
    setRooms(prevRooms => prevRooms.map(room => 
      room.id === roomId 
        ? { 
            ...room, 
            permissions: room.permissions.map(p => ({ ...p, allowed: true })) 
          } 
        : room
    ));
  };

  const handleDeleteRoom = (id: string) => {
    if (rooms.length <= 1) return; // Keep at least one room
    const newRooms = rooms.filter(r => r.id !== id);
    setRooms(newRooms);
    if (selectedRoomId === id) {
      setSelectedRoomId(newRooms[0].id);
    }
  };

  const handleSettingsClick = () => {
    setEditName(selectedRoom.name);
    setEditType(selectedRoom.type);
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    setRooms(prevRooms => prevRooms.map(room => 
      room.id === selectedRoomId 
        ? { ...room, name: editName, type: editType } 
        : room
    ));
    setIsSettingsOpen(false);
  };

  const handleAddGate = () => {
    const newId = (Date.now()).toString();
    const newRoom: Room = {
      id: newId,
      name: `신규 구역 ${rooms.length + 1}`,
      type: "일반구역",
      gateActive: false,
      inventory: [],
      permissions: [
        { rank: "부장", allowed: false },
        { rank: "과장", allowed: false },
        { rank: "대리", allowed: false },
        { rank: "사원", allowed: false }
      ],
      groups: ["미지정"]
    };
    setRooms([...rooms, newRoom]);
    setSelectedRoomId(newId);
  };

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Settings Modal Overlay */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
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
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50 px-6 text-lg font-bold"
                  placeholder="구역 이름을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">구역 유형</label>
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50 px-6 text-lg font-bold">
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-100">
                    <SelectItem value="보안구역">보안구역</SelectItem>
                    <SelectItem value="사무공간">사무공간</SelectItem>
                    <SelectItem value="공용공간">공용공간</SelectItem>
                    <SelectItem value="일반구역">일반구역</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setIsSettingsOpen(false)}
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
            onClick={handleAddGate}
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
              {rooms.map((room) => (
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
              
              {/* Decorative Hallway */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-full h-8 bg-gray-50/50 rounded-full border border-gray-100/50"></div>
              </div>
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
                  전체 선택
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {selectedRoom.permissions.map((p) => (
                  <button 
                    key={p.rank}
                    onClick={() => togglePermission(selectedRoom.id, p.rank)}
                    className={cn(
                      "p-5 rounded-2xl border-2 flex items-center justify-between transition-all text-left",
                      p.allowed ? "border-black bg-white" : "border-gray-100 bg-gray-50/50 opacity-60"
                    )}
                  >
                    <span className="text-base font-bold text-gray-900">{p.rank}</span>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                      p.allowed ? "border-black bg-black" : "border-gray-300"
                    )}>
                      {p.allowed && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Status */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  구역 내 주요 자산
                </h4>
                <span className="text-xs font-bold text-gray-400 italic">재고 관리 연동됨</span>
              </div>
              <div className="space-y-3">
                {selectedRoom.inventory.map((item) => (
                  <div key={item.name} className="p-5 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-base font-bold text-gray-900">{item.name}</p>
                      <p className="text-sm font-medium text-gray-400">{item.count}개 보유</p>
                    </div>
                    <Badge variant={item.exportAllowed ? "outline" : "destructive"} className="text-xs font-black uppercase tracking-tight px-3 py-1">
                      {item.exportAllowed ? "반출 가능" : "반출 불가"}
                    </Badge>
                  </div>
                ))}
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
                  <Badge key={group} className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-none rounded-xl px-4 py-2 font-bold text-sm flex items-center gap-2">
                    {group}
                    <Trash2 className="w-4 h-4 cursor-pointer hover:text-red-500" />
                  </Badge>
                ))}
                <Button variant="outline" size="sm" className="rounded-xl border-dashed border-gray-200 text-gray-400 h-10 px-4 font-bold">
                  <Plus className="w-4 h-4 mr-1" /> 추가
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
