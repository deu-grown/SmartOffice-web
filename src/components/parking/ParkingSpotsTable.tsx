// 주차면(ParkingSpot) CRUD 표 — useParkingSpots(filter) + 등록/수정/삭제 모달.
// 필터: zone(ZoneSelect) + spotType(REGULAR/DISABLED/EV) + status(ACTIVE/INACTIVE).
// 좌표 충돌·null XOR 사전 검증 임시 구현 — 백엔드 #16 채택 시 validateCoordinates 함수 제거.
import { useMemo, useState } from "react";
import { MoreHorizontal, Plus, AlertTriangle, LayoutGrid } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { ZoneSelect } from "@/src/components/common/ZoneSelect";
import { useZones } from "@/src/features/zone/hooks";
import {
  useCreateSpot,
  useDeleteSpot,
  useParkingSpots,
  useUpdateSpot,
} from "@/src/features/parking/hooks";
import type {
  ParkingSpotCreateRequest,
  ParkingSpotResponse,
  ParkingSpotUpdateRequest,
  SpotStatus,
  SpotType,
} from "@/src/features/parking/types";

const SPOT_TYPES: SpotType[] = ["REGULAR", "DISABLED", "EV"];
const SPOT_TYPE_LABEL: Record<SpotType, string> = {
  REGULAR: "일반",
  DISABLED: "장애인",
  EV: "EV 충전",
};
const SPOT_STATUSES: SpotStatus[] = ["ACTIVE", "INACTIVE"];
const SPOT_STATUS_LABEL: Record<SpotStatus, string> = {
  ACTIVE: "활성",
  INACTIVE: "비활성",
};

interface SpotFormState {
  zoneId: number | undefined;
  spotNumber: string;
  spotType: SpotType;
  deviceId: string;
  positionX: string;
  positionY: string;
  spotStatus: SpotStatus;
}

const emptyForm = (): SpotFormState => ({
  zoneId: undefined,
  spotNumber: "",
  spotType: "REGULAR",
  deviceId: "",
  positionX: "",
  positionY: "",
  spotStatus: "ACTIVE",
});

const toCreate = (form: SpotFormState): ParkingSpotCreateRequest => ({
  zoneId: form.zoneId as number,
  spotNumber: form.spotNumber.trim(),
  spotType: form.spotType,
  deviceId: form.deviceId.trim() ? Number(form.deviceId) : null,
  positionX: form.positionX.trim() ? Number(form.positionX) : null,
  positionY: form.positionY.trim() ? Number(form.positionY) : null,
  spotStatus: form.spotStatus,
});

const toUpdate = (form: SpotFormState): ParkingSpotUpdateRequest => ({
  spotNumber: form.spotNumber.trim(),
  spotType: form.spotType,
  deviceId: form.deviceId.trim() ? Number(form.deviceId) : null,
  positionX: form.positionX.trim() ? Number(form.positionX) : null,
  positionY: form.positionY.trim() ? Number(form.positionY) : null,
  spotStatus: form.spotStatus,
});

const fromSpot = (s: ParkingSpotResponse): SpotFormState => ({
  zoneId: s.zoneId,
  spotNumber: s.spotNumber,
  spotType: s.spotType,
  deviceId: s.deviceId !== null ? String(s.deviceId) : "",
  positionX: s.positionX !== null ? String(s.positionX) : "",
  positionY: s.positionY !== null ? String(s.positionY) : "",
  spotStatus: s.spotStatus,
});

interface Props {
  zoneId: number | undefined;
}

export function ParkingSpotsTable({ zoneId }: Props) {
  const [filterSpotType, setFilterSpotType] = useState<"ALL" | SpotType>("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | SpotStatus>("ALL");

  const [registerOpen, setRegisterOpen] = useState(false);
  const [newForm, setNewForm] = useState<SpotFormState>(emptyForm());

  const [editTarget, setEditTarget] = useState<ParkingSpotResponse | null>(null);
  const [editForm, setEditForm] = useState<SpotFormState>(emptyForm());

  const [deleteTarget, setDeleteTarget] = useState<ParkingSpotResponse | null>(null);

  const zonesQuery = useZones();
  // 등록/수정 모달 zone Select — FLOOR zoneType 만 노출 (AREA/ROOM 에 주차면 등록 도메인 의미 X).
  const zoneOptions = useMemo(
    () =>
      (zonesQuery.data ?? [])
        .filter((z) => z.zoneType === "FLOOR")
        .map((z) => ({
          id: z.id,
          name: z.name,
          suffix: `(${z.zoneType})`,
        })),
    [zonesQuery.data],
  );

  const listQuery = useParkingSpots({
    zoneId,
    spotType: filterSpotType !== "ALL" ? filterSpotType : undefined,
    status: filterStatus !== "ALL" ? filterStatus : undefined,
  });

  // 좌표 충돌 검증용 전체 spot 캐시 — ParkingManagement 의 useParkingSpots({}) 와 queryKey 공유.
  // 백엔드 #16 (좌표 UNIQUE 제약 + null XOR) 채택 시 본 hook + validateCoordinates 제거.
  const allSpotsQuery = useParkingSpots({});

  const createMutation = useCreateSpot();
  const updateMutation = useUpdateSpot();
  const deleteMutation = useDeleteSpot();

  const items = listQuery.data ?? [];

  // 좌표 사전 검증 (null XOR + 동일 zone 좌표 충돌). excludeSpotId 는 수정 시 자기 자신 제외용.
  const validateCoordinates = (form: SpotFormState, excludeSpotId?: number): string | null => {
    const x = form.positionX.trim() ? Number(form.positionX) : null;
    const y = form.positionY.trim() ? Number(form.positionY) : null;
    if ((x === null) !== (y === null)) {
      return "좌표 X·Y 는 둘 다 입력하거나 둘 다 비워주세요.";
    }
    if (x === null && y === null) return null;
    if (form.zoneId === undefined) return null;
    const conflict = (allSpotsQuery.data ?? []).find(
      (s) =>
        s.zoneId === form.zoneId &&
        s.positionX === x &&
        s.positionY === y &&
        s.spotId !== excludeSpotId,
    );
    if (conflict) {
      return `좌표 (${x}, ${y}) 는 이미 ${conflict.spotNumber} 가 사용 중입니다.`;
    }
    return null;
  };

  const handleOpenRegister = () => {
    setNewForm({ ...emptyForm(), zoneId });
    setRegisterOpen(true);
  };

  const handleRegister = () => {
    if (newForm.zoneId === undefined) {
      toast.error("구역을 선택해주세요.");
      return;
    }
    if (!newForm.spotNumber) {
      toast.error("주차면 번호는 필수입니다.");
      return;
    }
    const coordError = validateCoordinates(newForm);
    if (coordError) {
      toast.error(coordError);
      return;
    }
    createMutation.mutate(toCreate(newForm), {
      onSuccess: () => {
        toast.success("주차면이 등록되었습니다.");
        setRegisterOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "주차면 등록 실패");
      },
    });
  };

  const openEdit = (s: ParkingSpotResponse) => {
    setEditTarget(s);
    setEditForm(fromSpot(s));
  };

  const handleSaveEdit = () => {
    if (!editTarget) return;
    if (!editForm.spotNumber) {
      toast.error("주차면 번호는 필수입니다.");
      return;
    }
    const coordError = validateCoordinates(editForm, editTarget.spotId);
    if (coordError) {
      toast.error(coordError);
      return;
    }
    updateMutation.mutate(
      { id: editTarget.spotId, body: toUpdate(editForm) },
      {
        onSuccess: () => {
          toast.success("주차면 정보가 수정되었습니다.");
          setEditTarget(null);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "주차면 수정 실패");
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.spotId, {
      onSuccess: () => {
        toast.success("주차면이 삭제되었습니다.");
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "주차면 삭제 실패");
      },
    });
  };

  return (
    <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-black">주차면 관리</h3>
          <span className="text-xs font-bold text-gray-400">{items.length}개</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filterSpotType}
            onValueChange={(v) => setFilterSpotType(v as "ALL" | SpotType)}
          >
            <SelectTrigger className="w-[140px] h-10 bg-gray-50 border-none rounded-xl text-xs font-bold px-4">
              {filterSpotType === "ALL" ? (
                <span>모든 유형</span>
              ) : (
                <span>{SPOT_TYPE_LABEL[filterSpotType]}</span>
              )}
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100 rounded-xl font-bold">
              <SelectItem value="ALL">모든 유형</SelectItem>
              {SPOT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {SPOT_TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as "ALL" | SpotStatus)}
          >
            <SelectTrigger className="w-[140px] h-10 bg-gray-50 border-none rounded-xl text-xs font-bold px-4">
              {filterStatus === "ALL" ? (
                <span>모든 상태</span>
              ) : (
                <span>{SPOT_STATUS_LABEL[filterStatus]}</span>
              )}
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100 rounded-xl font-bold">
              <SelectItem value="ALL">모든 상태</SelectItem>
              {SPOT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {SPOT_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
            <DialogTrigger
              render={
                <Button
                  onClick={handleOpenRegister}
                  className="h-10 px-6 bg-zinc-900 text-white rounded-xl font-bold gap-2 shadow-md hover:bg-black"
                />
              }
            >
              <Plus className="w-4 h-4" />
              주차면 등록
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px] bg-white rounded-[32px] p-10 border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">주차면 신규 등록</DialogTitle>
                <DialogDescription className="text-gray-500 font-medium">
                  IoT 센서 매핑은 선택사항입니다 (deviceId 미지정 시 수동 점유 갱신).
                </DialogDescription>
              </DialogHeader>
              <SpotFormFields form={newForm} onChange={setNewForm} zoneOptions={zoneOptions} />
              <DialogFooter className="gap-2 sm:gap-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setRegisterOpen(false)}
                  className="rounded-2xl font-bold h-14 flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleRegister}
                  disabled={createMutation.isPending}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl font-bold h-14 flex-1 shadow-xl shadow-indigo-100"
                >
                  {createMutation.isPending ? "등록 중..." : "등록"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                주차면 번호
              </th>
              <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                구역
              </th>
              <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                유형
              </th>
              <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                센서
              </th>
              <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                점유
              </th>
              <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                상태
              </th>
              <th className="text-right py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((s, i) => (
              <motion.tr
                key={s.spotId}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-5 px-2 font-mono text-sm font-bold text-gray-900">
                  {s.spotNumber}
                </td>
                <td className="py-5 px-2 text-sm font-medium text-gray-600">{s.zoneName}</td>
                <td className="py-5 px-2">
                  <Badge className="rounded-lg font-bold border-none px-3 py-1 text-[11px] bg-gray-100 text-gray-700">
                    {SPOT_TYPE_LABEL[s.spotType]}
                  </Badge>
                </td>
                <td className="py-5 px-2 text-xs font-mono text-gray-500">
                  {s.deviceName ?? "—"}
                </td>
                <td className="py-5 px-2">
                  {s.occupied ? (
                    <span className="text-xs font-bold text-emerald-600">점유 중</span>
                  ) : (
                    <span className="text-xs font-bold text-gray-400">비어있음</span>
                  )}
                </td>
                <td className="py-5 px-2">
                  <Badge
                    className={cn(
                      "rounded-lg font-bold border-none px-3 py-1 text-[11px]",
                      s.spotStatus === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500",
                    )}
                  >
                    {SPOT_STATUS_LABEL[s.spotStatus]}
                  </Badge>
                </td>
                <td className="py-5 px-2 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-gray-100 group/btn"
                        />
                      }
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-400 group-hover/btn:text-gray-900" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white border-gray-100 rounded-2xl w-40 p-2 z-[200] shadow-xl overflow-hidden"
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-2">
                          주차면 관리
                        </DropdownMenuLabel>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator className="bg-gray-100 mb-1" />
                      <DropdownMenuItem
                        className="rounded-xl px-3 py-2 font-bold cursor-pointer hover:bg-gray-50 outline-none"
                        onClick={() => openEdit(s)}
                      >
                        주차면 수정
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-100 my-1" />
                      <DropdownMenuItem
                        className="rounded-xl px-3 py-2 font-bold cursor-pointer text-red-500 hover:bg-red-50"
                        onClick={() => setDeleteTarget(s)}
                      >
                        주차면 삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {!listQuery.isLoading && items.length === 0 && (
          <div className="py-20 text-center text-gray-400 text-sm">
            {zoneId !== undefined ? "해당 구역에 등록된 주차면이 없습니다." : "등록된 주차면이 없습니다."}
          </div>
        )}
        {listQuery.isLoading && (
          <div className="py-20 text-center text-gray-400 text-sm">주차면 목록 불러오는 중...</div>
        )}
        {listQuery.isError && (
          <div className="py-20 text-center text-red-500 text-sm">
            주차면 목록 조회 중 오류가 발생했습니다.
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-[560px] bg-white rounded-[32px] p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">주차면 수정</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              {editTarget?.spotNumber}
            </DialogDescription>
          </DialogHeader>
          <SpotFormFields form={editForm} onChange={setEditForm} zoneOptions={zoneOptions} disableZone />
          <DialogFooter className="gap-2 sm:gap-x-4">
            <Button
              variant="ghost"
              onClick={() => setEditTarget(null)}
              className="rounded-2xl font-bold h-14 flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
              className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl font-bold h-14 flex-1 shadow-xl shadow-indigo-100"
            >
              {updateMutation.isPending ? "수정 중..." : "수정 저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-[420px] bg-white rounded-[32px] p-10 border-none shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <DialogTitle className="text-xl font-black text-center">주차면 삭제 확인</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium text-center">
              <span className="font-bold text-gray-900">{deleteTarget?.spotNumber}</span> 주차면을
              삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-x-4 mt-6">
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              className="rounded-2xl font-bold h-12 flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-500 text-white hover:bg-red-600 rounded-2xl font-bold h-12 flex-1"
            >
              {deleteMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SpotFormFields({
  form,
  onChange,
  zoneOptions,
  disableZone,
}: {
  form: SpotFormState;
  onChange: (next: SpotFormState) => void;
  zoneOptions: { id: number; name: string; suffix?: string }[];
  disableZone?: boolean;
}) {
  return (
    <div className="space-y-6 py-6 font-sans">
      <div className="space-y-2">
        <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
          구역
        </Label>
        <ZoneSelect
          options={zoneOptions}
          value={form.zoneId}
          onChange={(id) => onChange({ ...form, zoneId: id })}
          triggerClassName="h-12 bg-gray-50 border-none rounded-2xl px-5 font-bold w-full"
          disabled={disableZone}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
            주차면 번호
          </Label>
          <Input
            value={form.spotNumber}
            onChange={(e) => onChange({ ...form, spotNumber: e.target.value })}
            placeholder="B1-001"
            className="h-12 bg-gray-50 border-none rounded-2xl px-5 font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
            유형
          </Label>
          <Select
            value={form.spotType}
            onValueChange={(v) => onChange({ ...form, spotType: v as SpotType })}
          >
            <SelectTrigger className="h-12 bg-gray-50 border-none rounded-2xl px-5 font-bold">
              <span>{SPOT_TYPE_LABEL[form.spotType]}</span>
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100 rounded-2xl font-bold">
              {SPOT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {SPOT_TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
            상태
          </Label>
          <Select
            value={form.spotStatus}
            onValueChange={(v) => onChange({ ...form, spotStatus: v as SpotStatus })}
          >
            <SelectTrigger className="h-12 bg-gray-50 border-none rounded-2xl px-5 font-bold">
              <span>{SPOT_STATUS_LABEL[form.spotStatus]}</span>
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100 rounded-2xl font-bold">
              {SPOT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {SPOT_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
            센서 device ID (선택)
          </Label>
          <Input
            value={form.deviceId}
            onChange={(e) => onChange({ ...form, deviceId: e.target.value })}
            placeholder="11"
            className="h-12 bg-gray-50 border-none rounded-2xl px-5 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
            좌표 X (선택, 정수 grid)
          </Label>
          <Input
            type="number"
            min={1}
            step={1}
            value={form.positionX}
            onChange={(e) => onChange({ ...form, positionX: e.target.value })}
            placeholder="예: 1~10"
            className="h-12 bg-gray-50 border-none rounded-2xl px-5 font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
            좌표 Y (선택, 정수 grid)
          </Label>
          <Input
            type="number"
            min={1}
            step={1}
            value={form.positionY}
            onChange={(e) => onChange({ ...form, positionY: e.target.value })}
            placeholder="예: 1~2"
            className="h-12 bg-gray-50 border-none rounded-2xl px-5 font-mono"
          />
        </div>
      </div>
    </div>
  );
}
