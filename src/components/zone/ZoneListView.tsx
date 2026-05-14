// 구역 목록 (평면도 그리드) - 좌측 패널.
// 묶음 2 커밋 2.1 ZoneManagement 분할 (빈 분할, mock 유지).
// 묶음 2 커밋 2.2 에서 useZones() 연결로 전환 예정.
import { Plus, Trash2, ShieldAlert, ShieldCheck, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Room } from "../../types";

interface ZoneListViewProps {
  selectedFloor: string;
  setSelectedFloor: (v: string) => void;
  floorRooms: Room[];
  selectedRoomId: string;
  setSelectedRoomId: (id: string) => void;
  onAddGateClick: () => void;
  onDeleteRoom: (id: string) => void;
}

export function ZoneListView({
  selectedFloor,
  setSelectedFloor,
  floorRooms,
  selectedRoomId,
  setSelectedRoomId,
  onAddGateClick,
  onDeleteRoom,
}: ZoneListViewProps) {
  return (
    <>
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
            onClick={onAddGateClick}
            className="bg-black text-white hover:bg-black/90 rounded-xl h-12 px-6 font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            보안 게이트 추가
          </Button>
        </div>
      </header>

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
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                        room.type === "보안구역" ? "bg-black text-white" : "bg-gray-100 text-gray-400"
                      )}
                    >
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
                  {room.groups.map((g) => (
                    <span key={g} className="text-[10px] font-bold text-gray-400">
                      #{g}
                    </span>
                  ))}
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRoom(room.id);
                }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

