// 주차 예약 관리 섹션 — ParkingManagement 내에서 사용.
import { useState } from "react";
import { CalendarClock, Trash2, Plus } from "lucide-react";
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
  useCreateReservation,
  useDeleteReservation,
  useParkingReservations,
} from "@/src/features/parking/hooks";
import type { ParkingReservationFilter, ReservationStatus } from "@/src/features/parking/types";

const STATUS_OPTIONS: { value: "all" | ReservationStatus; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "RESERVED", label: "예약 대기" },
  { value: "PARKED", label: "입차 중" },
  { value: "EXITED", label: "출차 완료" },
];

const STATUS_STYLE: Record<ReservationStatus, { label: string; className: string }> = {
  RESERVED: { label: "예약 대기", className: "bg-orange-500/10 text-orange-600" },
  PARKED: { label: "입차 중", className: "bg-green-500/10 text-green-600" },
  EXITED: { label: "출차 완료", className: "bg-gray-100 text-gray-500" },
};

interface ReservationSectionProps {
  /** 구역 선택 필터와 연동. */
  zoneId?: number;
}

export function ReservationSection({ zoneId }: ReservationSectionProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | ReservationStatus>("all");
  const [page, setPage] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addVehicleId, setAddVehicleId] = useState("");
  const [addZoneId, setAddZoneId] = useState(zoneId ? String(zoneId) : "");
  const [addReservedAt, setAddReservedAt] = useState("");

  const filter: ParkingReservationFilter = {
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(zoneId !== undefined && { zoneId }),
    page,
    size: 10,
  };

  const query = useParkingReservations(filter);
  const rows = query.data?.reservations ?? [];
  const totalElements = query.data?.totalElements ?? 0;
  const totalPages = Math.max(query.data?.totalPages ?? 1, 1);

  const createMutation = useCreateReservation();
  const deleteMutation = useDeleteReservation();

  const handleCreate = () => {
    if (!addVehicleId || !addZoneId || !addReservedAt) {
      toast.error("차량 ID, 구역 ID, 예약 시각은 필수입니다.");
      return;
    }
    createMutation.mutate(
      { vehicleId: Number(addVehicleId), zoneId: Number(addZoneId), reservedAt: addReservedAt },
      {
        onSuccess: () => {
          toast.success("예약이 등록되었습니다.");
          setIsAddOpen(false);
          setAddVehicleId(""); setAddZoneId(zoneId ? String(zoneId) : ""); setAddReservedAt("");
        },
        onError: (err: Error) => toast.error(err.message || "등록에 실패했습니다."),
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("이 예약을 취소하시겠습니까?")) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("예약이 취소되었습니다."),
      onError: (err: Error) => toast.error(err.message || "취소에 실패했습니다."),
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <CalendarClock className="w-5 h-5" />
          예약 관리
          <span className="text-sm font-normal text-gray-400">({totalElements}건)</span>
        </h2>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as typeof statusFilter); setPage(0); }}>
            <SelectTrigger className="h-10 w-36 bg-gray-50 border-gray-100 rounded-xl px-4 font-bold">
              <span>{STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "전체"}</span>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddOpen(true)} className="h-10 px-4 rounded-xl font-bold bg-black text-white hover:bg-black/90 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            예약 등록
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">차량번호</th>
              <th className="px-6 py-4">구역</th>
              <th className="px-6 py-4">주차면</th>
              <th className="px-6 py-4">예약 시각</th>
              <th className="px-6 py-4">입차 시각</th>
              <th className="px-6 py-4">상태</th>
              <th className="px-6 py-4 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {query.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((__, j) => <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>)}</tr>
              ))
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">예약 내역이 없습니다.</td></tr>
            ) : rows.map((r) => {
              const s = STATUS_STYLE[r.status];
              return (
                <tr key={r.reservationId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-black">{r.vehiclePlateNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.zoneName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.spotNumber ?? "-"}</td>
                  <td className="px-6 py-4 text-xs text-gray-600">{new Date(r.reservedAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs text-gray-600">{r.entryAt ? new Date(r.entryAt).toLocaleString() : "-"}</td>
                  <td className="px-6 py-4">
                    <Badge className={cn("border-none px-3 py-1 rounded-full text-[10px] font-bold", s.className)}>{s.label}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {r.status === "RESERVED" && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(r.reservationId)} disabled={deleteMutation.isPending}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 px-1">
          <span>전체 {totalElements}건</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(page - 1, 0))} disabled={page === 0} className="h-8 w-8 p-0 rounded-lg border-gray-100">◀</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(Math.min(page + 1, totalPages - 1))} disabled={page >= totalPages - 1} className="h-8 w-8 p-0 rounded-lg border-gray-100">▶</Button>
          </div>
        </div>
      )}

      {/* 예약 등록 모달 */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">예약 등록</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">차량 ID *</label>
                <Input value={addVehicleId} onChange={(e) => setAddVehicleId(e.target.value)} type="number" className="h-12 rounded-2xl border-gray-100 bg-gray-50 px-5" placeholder="등록된 차량 ID" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">구역 ID *</label>
                <Input value={addZoneId} onChange={(e) => setAddZoneId(e.target.value)} type="number" className="h-12 rounded-2xl border-gray-100 bg-gray-50 px-5" placeholder="주차 구역 ID" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">예약 시각 *</label>
                <Input value={addReservedAt} onChange={(e) => setAddReservedAt(e.target.value)} type="datetime-local" className="h-12 rounded-2xl border-gray-100 bg-gray-50 px-5" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="flex-1 h-12 rounded-2xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-100">취소</Button>
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
