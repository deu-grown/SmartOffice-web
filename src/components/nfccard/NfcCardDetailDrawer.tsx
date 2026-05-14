// G11 NFC 카드 상세 드로어 — 상태 변경(분실/회수/재활성) + 만료일 수정 + 삭제 (위험 액션 모달).
import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  useDeleteNfcCard,
  useNfcCardDetail,
  useUpdateNfcCard,
} from "@/src/features/nfccard/hooks";
import type { NfcCardStatus } from "@/src/features/nfccard/types";

const STATUS_LABEL: Record<NfcCardStatus, string> = {
  ACTIVE: "활성",
  LOST: "분실",
  INACTIVE: "비활성",
};
const STATUS_BADGE: Record<NfcCardStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600",
  LOST: "bg-red-50 text-red-500",
  INACTIVE: "bg-gray-100 text-gray-500",
};

interface NfcCardDetailDrawerProps {
  cardId: number | null;
  onClose: () => void;
}

export function NfcCardDetailDrawer({ cardId, onClose }: NfcCardDetailDrawerProps) {
  const { data, isLoading, isError, error } = useNfcCardDetail(cardId ?? undefined);
  const updateMutation = useUpdateNfcCard();
  const deleteMutation = useDeleteNfcCard();
  const [status, setStatus] = useState<NfcCardStatus | undefined>(undefined);
  const [expiredAt, setExpiredAt] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // data 변경 시 form 초기화.
  const effectiveStatus = status ?? data?.status;
  const effectiveExpiredAt = expiredAt || (data?.expiredAt ? data.expiredAt.slice(0, 16) : "");

  const isDirty =
    data !== undefined &&
    ((status && status !== data.status) ||
      (expiredAt && expiredAt !== (data.expiredAt?.slice(0, 16) ?? "")));

  const handleSave = () => {
    if (!data) return;
    updateMutation.mutate(
      {
        id: data.id,
        body: {
          status: status && status !== data.status ? status : undefined,
          expiredAt:
            expiredAt && expiredAt !== (data.expiredAt?.slice(0, 16) ?? "")
              ? `${expiredAt}:00`
              : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("카드 정보가 수정되었습니다.");
          setStatus(undefined);
          setExpiredAt("");
        },
        onError: (err) => toast.error(err?.message ?? "카드 수정에 실패했습니다."),
      },
    );
  };

  const handleDelete = () => {
    if (!data) return;
    deleteMutation.mutate(data.id, {
      onSuccess: () => {
        toast.success("NFC 카드가 삭제되었습니다.");
        setConfirmDelete(false);
        onClose();
      },
      onError: (err) => toast.error(err?.message ?? "카드 삭제에 실패했습니다."),
    });
  };

  return (
    <Dialog open={cardId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border-gray-100 text-black max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">NFC 카드 상세</DialogTitle>
          <DialogDescription className="text-gray-400">
            {data
              ? `${data.userName} (${data.employeeNumber}) · ${data.department ?? "부서 미지정"}`
              : ""}
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
            카드 정보를 불러오지 못했습니다: {error?.message ?? ""}
          </p>
        ) : data ? (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <ReadField label="UID" value={data.uid} mono />
              <ReadField label="유형" value={data.cardType} />
              <ReadField label="발급일" value={data.issuedAt.slice(0, 16).replace("T", " ")} />
              <ReadField label="현재 상태">
                <span
                  className={cn(
                    "text-[11px] font-bold px-2 py-1 rounded-full",
                    STATUS_BADGE[data.status],
                  )}
                >
                  {STATUS_LABEL[data.status]}
                </span>
              </ReadField>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div className="space-y-2">
                <Label htmlFor="card-status">상태 변경</Label>
                <Select
                  value={effectiveStatus}
                  onValueChange={(v) => setStatus(v as NfcCardStatus)}
                >
                  <SelectTrigger id="card-status" className="bg-gray-50 border-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">활성</SelectItem>
                    <SelectItem value="LOST">분실</SelectItem>
                    <SelectItem value="INACTIVE">비활성</SelectItem>
                  </SelectContent>
                </Select>
                {status === "LOST" && (
                  <p className="text-xs text-amber-600 font-medium">
                    분실 처리 시 본인 외 명령 — ADMIN 권한으로 강제 변경됩니다.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-exp">만료일</Label>
                <Input
                  id="card-exp"
                  type="datetime-local"
                  value={effectiveExpiredAt}
                  onChange={(e) => setExpiredAt(e.target.value)}
                  className="bg-gray-50 border-gray-100"
                />
              </div>
            </div>
          </div>
        ) : null}

        {data && (
          <DialogFooter className="pt-2 gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              disabled={deleteMutation.isPending}
            >
              카드 삭제
            </Button>
            <Button variant="ghost" onClick={onClose} className="text-gray-400">
              닫기
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isDirty || updateMutation.isPending}
              className="bg-black text-white hover:bg-black/90"
            >
              {updateMutation.isPending ? "저장 중..." : "변경 저장"}
            </Button>
          </DialogFooter>
        )}

        {confirmDelete && data && (
          <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <DialogContent className="bg-white border-gray-100 text-black max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">카드 삭제 확인</DialogTitle>
                <DialogDescription className="text-gray-500">
                  본인이 아닌 자료 변경입니다. ADMIN 권한으로 카드를 영구 삭제합니다.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-600 font-medium">
                UID {data.uid} ({data.userName}) 을 삭제합니다. 출입 로그 보유 카드는 백엔드가
                삭제를 차단합니다.
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setConfirmDelete(false)}
                  className="text-gray-400"
                >
                  돌아가기
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {deleteMutation.isPending ? "삭제 중..." : "강제 삭제"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReadField({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      {children ? (
        children
      ) : (
        <p className={cn("text-sm text-gray-900 font-medium", mono && "font-mono")}>
          {value ?? "-"}
        </p>
      )}
    </div>
  );
}
