// G11 NFC 카드 발급 모달 — 직원 검색(useUsers) + UID/유형/만료일 입력 + useRegisterNfcCard.
// PersonnelDetailDrawer 의 NFC 탭에서도 재사용: prefillUser 로 직원 prefill (검색 단계 skip).
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

import { useRegisterNfcCard } from "@/src/features/nfccard/hooks";
import { useUsers } from "@/src/features/user/hooks";
import type { UserListItem } from "@/src/features/user/types";

interface NfcCardIssueModalProps {
  open: boolean;
  onClose: () => void;
  /** 직원 prefill (PersonnelDetailDrawer 진입 시). 지정 시 검색 UI 노출 X. */
  prefillUser?: { id: number; name: string; employeeNumber: string };
}

export function NfcCardIssueModal({ open, onClose, prefillUser }: NfcCardIssueModalProps) {
  const [keyword, setKeyword] = useState("");
  const [pickedUser, setPickedUser] = useState<UserListItem | null>(null);
  const [uid, setUid] = useState("");
  const [cardType, setCardType] = useState("EMPLOYEE");
  const [expiredAt, setExpiredAt] = useState(""); // datetime-local

  const usersQuery = useUsers({ keyword: keyword.trim() || undefined, size: 8 });
  const candidates = usersQuery.data?.content ?? [];

  const registerMutation = useRegisterNfcCard();

  const targetUser = useMemo(() => {
    if (prefillUser) {
      return { id: prefillUser.id, name: prefillUser.name, employeeNumber: prefillUser.employeeNumber };
    }
    if (pickedUser) {
      return {
        id: pickedUser.id,
        name: pickedUser.name,
        employeeNumber: pickedUser.employeeNumber,
      };
    }
    return null;
  }, [prefillUser, pickedUser]);

  const reset = () => {
    setKeyword("");
    setPickedUser(null);
    setUid("");
    setCardType("EMPLOYEE");
    setExpiredAt("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!targetUser) {
      toast.error("발급 대상 직원을 선택해 주세요.");
      return;
    }
    if (!uid.trim()) {
      toast.error("NFC UID 를 입력해 주세요.");
      return;
    }
    registerMutation.mutate(
      {
        userId: targetUser.id,
        uid: uid.trim(),
        cardType,
        expiredAt: expiredAt ? `${expiredAt}:00` : null,
      },
      {
        onSuccess: () => {
          toast.success("NFC 카드가 발급되었습니다.");
          handleClose();
        },
        onError: (err) => {
          // 백엔드 UID 중복 검증 메시지(한국어) 그대로 노출.
          toast.error(err?.message ?? "카드 발급에 실패했습니다.");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-surface border-border text-foreground max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">NFC 카드 발급</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {targetUser
              ? `${targetUser.name} (${targetUser.employeeNumber}) 에게 카드를 발급합니다.`
              : "발급 대상 직원을 먼저 선택해 주세요."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!prefillUser && (
            <div className="space-y-2">
              <Label>직원 검색</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="이름/사번/이메일로 검색"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-9 bg-surface-2 border-border"
                />
              </div>
              {keyword.trim() && (
                <div className="max-h-48 overflow-y-auto border border-border rounded-2xl divide-y divide-border">
                  {candidates.length === 0 ? (
                    <p className="px-3 py-3 text-xs text-muted-foreground">검색 결과가 없습니다.</p>
                  ) : (
                    candidates.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setPickedUser(u);
                          setKeyword("");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-surface-2 flex items-center justify-between text-sm"
                      >
                        <span className="font-medium">
                          {u.name} <span className="text-muted-foreground">({u.employeeNumber})</span>
                        </span>
                        <span className="text-xs text-muted-foreground">{u.department ?? "-"}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-uid">NFC UID</Label>
              <Input
                id="card-uid"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="예: 04A1B2C3D4E5F6"
                className="font-mono bg-surface-2 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-type">카드 유형</Label>
              <Select value={cardType} onValueChange={(v) => setCardType(v)}>
                <SelectTrigger id="card-type" className="bg-surface-2 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border">
                  <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                  <SelectItem value="VISITOR">VISITOR</SelectItem>
                  <SelectItem value="TEMP">TEMP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-exp">만료일 (선택)</Label>
            <Input
              id="card-exp"
              type="datetime-local"
              value={expiredAt}
              onChange={(e) => setExpiredAt(e.target.value)}
              className="bg-surface-2 border-border"
            />
            <p className="text-xs text-muted-foreground">미입력 시 만료 없음 (관리자가 추후 수정 가능).</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleClose} className="text-muted-foreground hover:text-foreground hover:bg-surface-2">
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={registerMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {registerMutation.isPending ? "발급 중..." : "발급하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
