// 구역 관리 페이지 컨테이너 — features/zone 흡수 (묶음 2 커밋 2.2 mock 제거).
// mock 의 gateActive/permissions/groups/floor 모델 모두 제거. 백엔드 zone 도메인은 단순 계층 (FLOOR/AREA/ROOM + parentId).
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  useCreateZone,
  useDeleteZone,
  useUpdateZone,
  useZones,
} from "@/src/features/zone/hooks";
import type { ZoneType } from "@/src/features/zone/types";
import { ZoneListView } from "../zone/ZoneListView";
import { ZoneDetailView } from "../zone/ZoneDetailView";
import { zoneTypeLabel } from "../zone/tabs/ZoneInfoTab";

const ZONE_TYPES: ZoneType[] = ["FLOOR", "AREA", "ROOM"];

export function ZoneManagement() {
  const zonesQuery = useZones();
  const createMutation = useCreateZone();
  const updateMutation = useUpdateZone();
  const deleteMutation = useDeleteZone();

  const allZones = useMemo(() => zonesQuery.data ?? [], [zonesQuery.data]);

  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  // 등록 모달
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<ZoneType>("ROOM");
  const [newDescription, setNewDescription] = useState("");

  // 수정 모달
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<ZoneType>("ROOM");
  const [editDescription, setEditDescription] = useState("");

  const selectedZone = useMemo(
    () => (selectedZoneId !== null ? allZones.find((z) => z.id === selectedZoneId) : undefined),
    [allZones, selectedZoneId]
  );

  const openAddModal = () => {
    setNewName("");
    setNewType("ROOM");
    setNewDescription("");
    setIsAddOpen(true);
  };

  const handleCreate = () => {
    if (!newName.trim()) {
      toast.error("구역 이름을 입력해 주세요.");
      return;
    }
    createMutation.mutate(
      {
        name: newName.trim(),
        zoneType: newType,
        // 새 zone 의 parent: 현재 선택된 FLOOR 의 자식으로 등록 (FLOOR 자체 등록은 parentId=null).
        parentId: newType === "FLOOR" ? null : selectedFloorId ?? null,
        description: newDescription.trim() || null,
      },
      {
        onSuccess: (res) => {
          toast.success("구역이 등록되었습니다.");
          setIsAddOpen(false);
          // FLOOR 등록 시 곧바로 선택. 자식 등록 시 그대로 자식 그리드에서 선택.
          if (newType === "FLOOR") {
            setSelectedFloorId(res.id);
            setSelectedZoneId(null);
          } else {
            setSelectedZoneId(res.id);
          }
        },
        onError: (err: Error) => {
          toast.error(err.message || "구역 등록에 실패했습니다.");
        },
      }
    );
  };

  const openEditModal = () => {
    if (!selectedZone) return;
    setEditName(selectedZone.name);
    setEditType(selectedZone.zoneType);
    setEditDescription(selectedZone.description ?? "");
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedZone) return;
    if (!editName.trim()) {
      toast.error("구역 이름을 입력해 주세요.");
      return;
    }
    updateMutation.mutate(
      {
        id: selectedZone.id,
        body: {
          name: editName.trim(),
          zoneType: editType,
          description: editDescription.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("구역 정보가 수정되었습니다.");
          setIsEditOpen(false);
        },
        onError: (err: Error) => {
          toast.error(err.message || "구역 수정에 실패했습니다.");
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    const zone = allZones.find((z) => z.id === id);
    if (!zone) return;
    if (!window.confirm(`'${zone.name}' 구역을 삭제하시겠습니까?\n하위 구역 또는 설치 장치가 있으면 삭제할 수 없습니다.`)) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("구역이 삭제되었습니다.");
        if (selectedZoneId === id) setSelectedZoneId(null);
        if (selectedFloorId === id) setSelectedFloorId(null);
      },
      onError: (err: Error) => {
        toast.error(err.message || "구역 삭제에 실패했습니다.");
      },
    });
  };

  const handleDeleteSelected = () => {
    if (selectedZoneId !== null) handleDelete(selectedZoneId);
  };

  if (zonesQuery.isLoading) {
    return (
      <div className="space-y-8 pb-12">
        <Skeleton className="h-16 w-full max-w-md" />
        <Skeleton className="h-[500px] w-full rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 relative">
      {/* 등록 모달 */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">구역 등록</h2>
              <p className="text-gray-500 font-medium">
                {newType === "FLOOR" ? "새 층(FLOOR)을 등록합니다." : "현재 선택된 층의 자식 구역으로 등록합니다."}
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">구역 이름</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50 px-6 text-lg font-bold"
                  placeholder="예: 회의실 C / 1층 / 휴게실"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">구역 유형</label>
                <div className="grid grid-cols-3 gap-3">
                  {ZONE_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewType(t)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-center font-bold",
                        newType === t
                          ? "border-black bg-white shadow-sm"
                          : "border-gray-50 bg-gray-50/50 hover:border-gray-100"
                      )}
                    >
                      <div className="text-sm">{zoneTypeLabel(t)}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{t}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">설명 (선택)</label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50 px-6 text-base"
                  placeholder="구역에 대한 간단한 설명"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
                disabled={createMutation.isPending}
                className="flex-1 h-14 rounded-2xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              >
                취소
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex-1 h-14 rounded-2xl font-bold bg-black text-white hover:bg-black/90"
              >
                {createMutation.isPending ? "등록 중..." : "등록하기"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 수정 모달 */}
      {isEditOpen && selectedZone && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">구역 정보 수정</h2>
              <p className="text-gray-500 font-medium">#{selectedZone.id} · {selectedZone.name}</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">구역 이름</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50 px-6 text-lg font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">구역 유형</label>
                <Select value={editType} onValueChange={(v) => setEditType(v as ZoneType)}>
                  <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50 px-6 text-base font-bold">
                    {/* SelectValue 가 SelectItem children 자동 매핑 안 되는 결함 회피 — 명시 텍스트 렌더. */}
                    <span>
                      {zoneTypeLabel(editType)} ({editType})
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {ZONE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {zoneTypeLabel(t)} ({t})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">설명</label>
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50 px-6 text-base"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setIsEditOpen(false)}
                disabled={updateMutation.isPending}
                className="flex-1 h-14 rounded-2xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              >
                취소
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="flex-1 h-14 rounded-2xl font-bold bg-black text-white hover:bg-black/90"
              >
                {updateMutation.isPending ? "저장 중..." : "저장하기"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 본문 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <ZoneListView
            selectedFloorId={selectedFloorId}
            setSelectedFloorId={(id) => {
              setSelectedFloorId(id);
              setSelectedZoneId(null);
            }}
            selectedZoneId={selectedZoneId}
            setSelectedZoneId={setSelectedZoneId}
            onAddZoneClick={openAddModal}
            onDeleteZone={handleDelete}
          />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <ZoneDetailView
            selectedZoneId={selectedZoneId}
            onEditClick={openEditModal}
            onDeleteClick={handleDeleteSelected}
          />
        </div>
      </div>
    </div>
  );
}
