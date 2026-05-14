// G10 회의실 — 예약 상세 드로어. 수정(PUT) / 취소(DELETE) 위험 액션 모달 포함.
// ADMIN 강제 변경 가능 — 사유 노출("본인 예약이 아닐 수 있습니다") 필수 (마스터플랜 7절 #5 완화 패턴).
import React, { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import {
  useCancelReservation,
  useReservationDetail,
  useUpdateReservation,
} from "@/src/features/reservation/hooks";
import type {
  ReservationStatus,
  ReservationUpdateRequest,
} from "@/src/features/reservation/types";

const STATUS_LABEL: Record<ReservationStatus, string> = {
  CONFIRMED: "예약 확정",
  CHECKED_IN: "체크인 완료",
  CANCELLED: "취소됨",
  NO_SHOW: "노쇼",
};

interface ReservationDetailDrawerProps {
  reservationId: number | null;
  onClose: () => void;
}

export function ReservationDetailDrawer({
  reservationId,
  onClose,
}: ReservationDetailDrawerProps) {
  const { data, isLoading, isError, error } = useReservationDetail(reservationId ?? undefined);
  const updateMutation = useUpdateReservation();
  const cancelMutation = useCancelReservation();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data) return;
    const form = new FormData(e.currentTarget);
    const body: ReservationUpdateRequest = {
      startTime: ((form.get("startTime") as string) || "").trim() || undefined,
      endTime: ((form.get("endTime") as string) || "").trim() || undefined,
      purpose: ((form.get("purpose") as string) || "").trim() || undefined,
    };
    updateMutation.mutate(
      { id: data.reservationId, body },
      {
        onSuccess: () => {
          toast.success("예약이 수정되었습니다.");
        },
        onError: (err) => toast.error(err?.message ?? "예약 수정에 실패했습니다."),
      },
    );
  };

  const handleCancel = () => {
    if (!data) return;
    cancelMutation.mutate(data.reservationId, {
      onSuccess: () => {
        toast.success("예약이 취소되었습니다.");
        setConfirmCancel(false);
        onClose();
      },
      onError: (err) => toast.error(err?.message ?? "예약 취소에 실패했습니다."),
    });
  };

  return (
    <Dialog open={reservationId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border-gray-100 text-black max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">예약 상세</DialogTitle>
          <DialogDescription className="text-gray-400">
            {data ? `${data.zoneName} · ${data.userName} · ${STATUS_LABEL[data.status]}` : ""}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <p className="py-6 text-sm font-bold text-red-500">
            예약 정보를 불러오지 못했습니다: {error?.message ?? ""}
          </p>
        ) : data ? (
          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-700 font-medium">
              본인 예약이 아닐 수 있습니다. ADMIN 권한으로 강제 변경됩니다.
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>회의실</Label>
                <Input
                  value={data.zoneName}
                  disabled
                  className="bg-gray-100 border-gray-100 text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label>예약자</Label>
                <Input
                  value={data.userName}
                  disabled
                  className="bg-gray-100 border-gray-100 text-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="r-start">시작 시각</Label>
                <Input
                  id="r-start"
                  name="startTime"
                  type="datetime-local"
                  defaultValue={toLocal(data.startTime)}
                  className="bg-gray-50 border-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-end">종료 시각</Label>
                <Input
                  id="r-end"
                  name="endTime"
                  type="datetime-local"
                  defaultValue={toLocal(data.endTime)}
                  className="bg-gray-50 border-gray-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="r-purpose">목적</Label>
              <Input
                id="r-purpose"
                name="purpose"
                defaultValue={data.purpose ?? ""}
                className="bg-gray-50 border-gray-100"
              />
            </div>

            {data.checkInTime && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs text-emerald-700">
                체크인 완료: {new Date(data.checkInTime).toLocaleString("ko-KR")}
              </div>
            )}

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmCancel(true)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                disabled={data.status === "CANCELLED" || cancelMutation.isPending}
              >
                예약 취소
              </Button>
              <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400">
                닫기
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-black text-white hover:bg-black/90"
              >
                {updateMutation.isPending ? "수정 중..." : "수정 적용"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}

        {confirmCancel && data && (
          <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
            <DialogContent className="bg-white border-gray-100 text-black max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">예약 취소 확인</DialogTitle>
                <DialogDescription className="text-gray-500">
                  본인 예약이 아닐 수 있습니다. ADMIN 권한으로 강제 취소됩니다.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-600 font-medium">
                {data.userName} 의 {new Date(data.startTime).toLocaleString("ko-KR")} 예약을
                취소합니다. 되돌릴 수 없습니다.
              </div>
              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setConfirmCancel(false)} className="text-gray-400">
                  돌아가기
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {cancelMutation.isPending ? "취소 중..." : "강제 취소"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ISO LocalDateTime ("2026-05-15T10:00:00") → datetime-local input value ("2026-05-15T10:00").
function toLocal(iso: string): string {
  return iso.slice(0, 16);
}
