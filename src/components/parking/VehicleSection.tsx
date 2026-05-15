// 차량 관리 섹션 — ParkingManagement 내에서 사용.
import { useState } from "react";
import { Car, Trash2, UserPlus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  useCreateVehicle,
  useDeleteVehicle,
  useVehicles,
} from "@/src/features/vehicle/hooks";
import type { VehicleFilter, VehicleType } from "@/src/features/vehicle/types";

const VEHICLE_TYPE_OPTIONS: { value: "all" | VehicleType; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "STAFF", label: "직원 차량" },
  { value: "VISITOR", label: "방문자 차량" },
];

const TYPE_STYLE: Record<VehicleType, { label: string; className: string }> = {
  STAFF: { label: "직원", className: "bg-blue-500/10 text-blue-600" },
  VISITOR: { label: "방문자", className: "bg-orange-500/10 text-orange-600" },
};

export function VehicleSection() {
  const [typeFilter, setTypeFilter] = useState<"all" | VehicleType>("all");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addPlate, setAddPlate] = useState("");
  const [addType, setAddType] = useState<VehicleType>("STAFF");
  const [addOwner, setAddOwner] = useState("");
  const [addUserId, setAddUserId] = useState("");
  const [addPurpose, setAddPurpose] = useState("");

  const filter: VehicleFilter = {
    ...(typeFilter !== "all" && { vehicleType: typeFilter }),
    ...(keyword.trim() && { keyword: keyword.trim() }),
    page,
    size: 10,
  };

  const query = useVehicles(filter);
  const rows = query.data?.vehicles ?? [];
  const totalElements = query.data?.totalElements ?? 0;
  const totalPages = Math.max(query.data?.totalPages ?? 1, 1);

  const createMutation = useCreateVehicle();
  const deleteMutation = useDeleteVehicle();

  const resetForm = () => {
    setAddPlate(""); setAddType("STAFF"); setAddOwner(""); setAddUserId(""); setAddPurpose("");
  };

  const handleCreate = () => {
    if (!addPlate.trim() || !addOwner.trim()) {
      toast.error("차량번호와 소유자 이름은 필수입니다.");
      return;
    }
    createMutation.mutate(
      {
        plateNumber: addPlate.trim(),
        vehicleType: addType,
        ownerName: addOwner.trim(),
        ownerUserId: addUserId ? Number(addUserId) : null,
        purpose: addPurpose.trim() || null,
      },
      {
        onSuccess: () => { toast.success("차량이 등록되었습니다."); setIsAddOpen(false); resetForm(); },
        onError: (err: Error) => toast.error(err.message || "등록에 실패했습니다."),
      },
    );
  };

  const handleDelete = (id: number, plate: string) => {
    if (!window.confirm(`'${plate}' 차량을 삭제하시겠습니까?`)) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("차량이 삭제되었습니다."),
      onError: (err: Error) => toast.error(err.message || "삭제에 실패했습니다."),
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <Car className="w-5 h-5" />
          차량 관리
          <span className="text-sm font-normal text-gray-400">({totalElements}대 등록)</span>
        </h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="번호판 · 소유자"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
              className="pl-9 h-10 bg-gray-50 border-gray-100 rounded-xl w-44"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as typeof typeFilter); setPage(0); }}>
            <SelectTrigger className="h-10 w-36 bg-gray-50 border-gray-100 rounded-xl px-4 font-bold">
              <span>{VEHICLE_TYPE_OPTIONS.find((o) => o.value === typeFilter)?.label ?? "전체"}</span>
            </SelectTrigger>
            <SelectContent>
              {VEHICLE_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddOpen(true)} className="h-10 px-4 rounded-xl font-bold bg-black text-white hover:bg-black/90 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            등록
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">차량번호</th>
              <th className="px-6 py-4">구분</th>
              <th className="px-6 py-4">소유자</th>
              <th className="px-6 py-4">용도</th>
              <th className="px-6 py-4 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {query.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((__, j) => <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>)}</tr>
              ))
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">등록된 차량이 없습니다.</td></tr>
            ) : rows.map((v) => {
              const s = TYPE_STYLE[v.vehicleType];
              return (
                <tr key={v.vehicleId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-black">{v.plateNumber}</td>
                  <td className="px-6 py-4">
                    <Badge className={cn("border-none px-3 py-1 rounded-full text-[10px] font-bold", s.className)}>{s.label}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {v.ownerName}
                    {v.ownerUserName && <span className="ml-1 text-gray-400 text-xs">({v.ownerUserName})</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{v.purpose ?? "-"}</td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(v.vehicleId, v.plateNumber)} disabled={deleteMutation.isPending}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 px-1">
          <span>전체 {totalElements}대</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(page - 1, 0))} disabled={page === 0} className="h-8 w-8 p-0 rounded-lg border-gray-100">◀</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(Math.min(page + 1, totalPages - 1))} disabled={page >= totalPages - 1} className="h-8 w-8 p-0 rounded-lg border-gray-100">▶</Button>
          </div>
        </div>
      )}

      {/* 등록 모달 */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">차량 등록</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 ml-1">차량번호 *</label>
                  <Input value={addPlate} onChange={(e) => setAddPlate(e.target.value)} className="h-12 rounded-2xl border-gray-100 bg-gray-50 px-5" placeholder="12가 3456" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 ml-1">구분 *</label>
                  <Select value={addType} onValueChange={(v) => setAddType(v as VehicleType)}>
                    <SelectTrigger className="h-12 rounded-2xl border-gray-100 bg-gray-50 px-5 font-bold">
                      <span>{addType === "STAFF" ? "직원 차량" : "방문자 차량"}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STAFF">직원 차량</SelectItem>
                      <SelectItem value="VISITOR">방문자 차량</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 ml-1">소유자 이름 *</label>
                  <Input value={addOwner} onChange={(e) => setAddOwner(e.target.value)} className="h-12 rounded-2xl border-gray-100 bg-gray-50 px-5" placeholder="홍길동" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 ml-1">직원 ID</label>
                  <Input value={addUserId} onChange={(e) => setAddUserId(e.target.value)} type="number" className="h-12 rounded-2xl border-gray-100 bg-gray-50 px-5" placeholder="직원이면 입력" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">용도</label>
                <Input value={addPurpose} onChange={(e) => setAddPurpose(e.target.value)} className="h-12 rounded-2xl border-gray-100 bg-gray-50 px-5" placeholder="방문 미팅 (선택)" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setIsAddOpen(false); resetForm(); }} className="flex-1 h-12 rounded-2xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-100">취소</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="flex-1 h-12 rounded-2xl font-bold bg-black text-white hover:bg-black/90">
                {createMutation.isPending ? "등록 중..." : "등록"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
