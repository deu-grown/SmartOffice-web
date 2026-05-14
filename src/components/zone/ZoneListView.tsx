// 구역 목록 (좌측 패널) — features/zone 흡수 후 mock 제거 (묶음 2 커밋 2.2).
// 구조: 상단 FLOOR 셀렉터 + 헤더 (구역 등록 버튼) + 자식 zone 그리드.
// floor 모델 부재 — zoneType=FLOOR 인 zone 자체가 "층". 선택된 FLOOR 의 자식(parentId === FLOOR.id) 만 표시.
import { useEffect, useMemo } from "react";
import { Plus, Trash2, Layers, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useZones } from "@/src/features/zone/hooks";
import type { ZoneListItem } from "@/src/features/zone/types";
import { zoneTypeLabel } from "./tabs/ZoneInfoTab";

interface ZoneListViewProps {
  selectedFloorId: number | null;
  setSelectedFloorId: (id: number | null) => void;
  selectedZoneId: number | null;
  setSelectedZoneId: (id: number | null) => void;
  onAddZoneClick: () => void;
  onDeleteZone: (id: number) => void;
}

export function ZoneListView({
  selectedFloorId,
  setSelectedFloorId,
  selectedZoneId,
  setSelectedZoneId,
  onAddZoneClick,
  onDeleteZone,
}: ZoneListViewProps) {
  const zonesQuery = useZones();
  const allZones: ZoneListItem[] = useMemo(() => zonesQuery.data ?? [], [zonesQuery.data]);

  const floors = useMemo(() => allZones.filter((z) => z.zoneType === "FLOOR"), [allZones]);
  const currentFloor = useMemo(
    () => (selectedFloorId !== null ? floors.find((f) => f.id === selectedFloorId) : null),
    [floors, selectedFloorId]
  );
  const childZones = useMemo(
    () => (currentFloor ? allZones.filter((z) => z.parentId === currentFloor.id) : []),
    [allZones, currentFloor]
  );

  // FLOOR 목록 로딩 완료 시 첫 항목 자동 선택. 자식 zone 변경 시 선택 자동 갱신.
  useEffect(() => {
    if (selectedFloorId === null && floors.length > 0) {
      setSelectedFloorId(floors[0].id);
    }
  }, [floors, selectedFloorId, setSelectedFloorId]);

  useEffect(() => {
    if (childZones.length > 0 && (selectedZoneId === null || !childZones.some((z) => z.id === selectedZoneId))) {
      setSelectedZoneId(childZones[0].id);
    } else if (childZones.length === 0 && selectedZoneId !== null) {
      setSelectedZoneId(null);
    }
  }, [childZones, selectedZoneId, setSelectedZoneId]);

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">구역 관리</h1>
          <p className="text-gray-500 text-lg font-medium">건물 내 구역 계층을 관리합니다 (FLOOR → AREA/ROOM)</p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedFloorId !== null ? String(selectedFloorId) : ""}
            onValueChange={(v) => setSelectedFloorId(v ? Number(v) : null)}
          >
            <SelectTrigger className="w-[180px] bg-white border-gray-100 rounded-xl h-12 font-bold">
              <SelectValue placeholder="층 선택" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100">
              {floors.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400">FLOOR 구역 없음</div>
              ) : (
                floors.map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>
                    {f.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={onAddZoneClick}
            className="bg-black text-white hover:bg-black/90 rounded-xl h-12 px-6 font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            구역 추가
          </Button>
        </div>
      </header>

      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-gray-400" />
            {currentFloor ? `${currentFloor.name} 자식 구역` : "구역 그리드"}
          </h3>
          <div className="flex gap-4 text-xs font-bold text-gray-400">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>AREA · ROOM</span>
            </div>
          </div>
        </div>

        {zonesQuery.isLoading ? (
          <div className="flex-1 grid grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : zonesQuery.isError ? (
          <div className="flex-1 flex items-center justify-center text-red-500 text-sm font-medium">
            구역 목록을 불러오지 못했습니다.
          </div>
        ) : childZones.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            {currentFloor
              ? `${currentFloor.name} 에 등록된 자식 구역이 없습니다.`
              : "FLOOR 구역을 먼저 등록해 주세요."}
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-2 gap-4 relative">
            {childZones.map((zone) => (
              <div key={zone.id} className="relative group">
                <button
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={cn(
                    "w-full h-full relative p-6 rounded-2xl border-2 transition-all text-left flex flex-col justify-between min-h-[140px]",
                    selectedZoneId === zone.id
                      ? "border-black bg-gray-50 shadow-md"
                      : "border-gray-50 bg-white hover:border-gray-200"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                          zone.zoneType === "ROOM"
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-500"
                        )}
                      >
                        {zoneTypeLabel(zone.zoneType)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">#{zone.id}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">{zone.name}</h4>
                  </div>
                  {zone.description && (
                    <p className="mt-3 text-xs text-gray-400 line-clamp-2">{zone.description}</p>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteZone(zone.id);
                  }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
