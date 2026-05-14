// 구역 상세 - 장치 목록 탭. features/device 흡수 (묶음 2 커밋 2.3).
// 백엔드 GET /api/v1/devices 는 전체 목록만 제공 — 본 탭에서 zoneId 클라이언트 필터링.
import { useMemo, useState } from "react";
import { Plus, Trash2, Wifi, WifiOff, Cpu } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { toast } from "sonner";

import { useCreateDevice, useDeleteDevice, useDevices, useUpdateDevice } from "@/src/features/device/hooks";
import type { DeviceListItem, DeviceStatus } from "@/src/features/device/types";

interface DeviceListTabProps {
  /** 본 zone 의 zoneId. 문자열로 들어오는 부모 인터페이스(ZoneDetailView) 호환을 위해 string. */
  zoneId?: string;
}

export function DeviceListTab({ zoneId }: DeviceListTabProps) {
  const zoneIdNum = zoneId !== undefined ? Number(zoneId) : NaN;
  const devicesQuery = useDevices();
  const createMutation = useCreateDevice();
  const updateMutation = useUpdateDevice();
  const deleteMutation = useDeleteDevice();

  const filtered = useMemo(() => {
    const list = devicesQuery.data ?? [];
    if (Number.isNaN(zoneIdNum)) return list;
    return list.filter((d) => d.zoneId === zoneIdNum);
  }, [devicesQuery.data, zoneIdNum]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("ENV_SENSOR");
  const [newSerial, setNewSerial] = useState("");

  const [editTarget, setEditTarget] = useState<DeviceListItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editSerial, setEditSerial] = useState("");
  const [editStatus, setEditStatus] = useState<DeviceStatus>("ACTIVE");

  const handleCreate = () => {
    if (Number.isNaN(zoneIdNum)) {
      toast.error("zone 정보가 없습니다.");
      return;
    }
    if (!newName.trim() || !newType.trim()) {
      toast.error("장치명·유형은 필수입니다.");
      return;
    }
    createMutation.mutate(
      {
        zoneId: zoneIdNum,
        name: newName.trim(),
        deviceType: newType.trim(),
        serialNumber: newSerial.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("장치가 등록되었습니다.");
          setIsAddOpen(false);
          setNewName("");
          setNewType("ENV_SENSOR");
          setNewSerial("");
        },
        onError: (err: Error) => toast.error(err.message || "장치 등록에 실패했습니다."),
      }
    );
  };

  const openEdit = (d: DeviceListItem) => {
    setEditTarget(d);
    setEditName(d.name);
    setEditType(d.deviceType);
    setEditSerial(d.serialNumber ?? "");
    setEditStatus(d.status);
  };

  const handleUpdate = () => {
    if (!editTarget) return;
    updateMutation.mutate(
      {
        id: editTarget.id,
        body: {
          name: editName.trim() || undefined,
          deviceType: editType.trim() || undefined,
          serialNumber: editSerial.trim() || null,
          status: editStatus,
        },
      },
      {
        onSuccess: () => {
          toast.success("장치 정보가 수정되었습니다.");
          setEditTarget(null);
        },
        onError: (err: Error) => toast.error(err.message || "장치 수정에 실패했습니다."),
      }
    );
  };

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`'${name}' 장치를 삭제하시겠습니까?`)) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("장치가 삭제되었습니다."),
      onError: (err: Error) => toast.error(err.message || "장치 삭제에 실패했습니다."),
    });
  };

  if (devicesQuery.isLoading) {
    return (
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (devicesQuery.isError) {
    return (
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <p className="text-red-500 text-sm font-medium">장치 목록을 불러오지 못했습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
      {/* 등록 모달 */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">장치 등록</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">장치명</label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-12 rounded-2xl" placeholder="예: 환경 센서 B" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">유형</label>
                <Input value={newType} onChange={(e) => setNewType(e.target.value)} className="h-12 rounded-2xl font-mono" placeholder="ENV_SENSOR / NFC_READER / POWER_METER 등" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">시리얼 번호 (선택)</label>
                <Input value={newSerial} onChange={(e) => setNewSerial(e.target.value)} className="h-12 rounded-2xl font-mono" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setIsAddOpen(false)} disabled={createMutation.isPending} className="flex-1 h-12 rounded-2xl font-bold">
                취소
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="flex-1 h-12 rounded-2xl font-bold bg-black text-white hover:bg-black/90">
                {createMutation.isPending ? "등록 중..." : "등록"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 수정 모달 */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900">장치 수정</h2>
              <p className="text-xs font-mono text-gray-400">#{editTarget.id}</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">장치명</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-12 rounded-2xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">유형</label>
                <Input value={editType} onChange={(e) => setEditType(e.target.value)} className="h-12 rounded-2xl font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">시리얼</label>
                <Input value={editSerial} onChange={(e) => setEditSerial(e.target.value)} className="h-12 rounded-2xl font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">상태</label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as DeviceStatus)}>
                  <SelectTrigger className="h-12 rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setEditTarget(null)} disabled={updateMutation.isPending} className="flex-1 h-12 rounded-2xl font-bold">
                취소
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="flex-1 h-12 rounded-2xl font-bold bg-black text-white hover:bg-black/90">
                {updateMutation.isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-gray-400" />
          설치 장치 ({filtered.length})
        </h3>
        <Button onClick={() => setIsAddOpen(true)} disabled={Number.isNaN(zoneIdNum)} className="bg-black text-white hover:bg-black/90 rounded-xl h-10 px-4 font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          장치 추가
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">본 구역에 설치된 장치가 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div
              key={d.id}
              className="p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => openEdit(d)}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", d.status === "ACTIVE" ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-300")}>
                  {d.status === "ACTIVE" ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">{d.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono truncate">
                    {d.deviceType} · {d.serialNumber ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={cn("rounded-full font-bold px-3 py-1 border-none", d.status === "ACTIVE" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400")}>
                  {d.status}
                </Badge>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(d.id, d.name);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="장치 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
