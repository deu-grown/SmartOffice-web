import React, { useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { useDepartments } from "@/src/features/department/hooks";
import { useUserAccessLogs } from "@/src/features/user/hooks";
import type { UserListItem, UserUpdateRequest } from "@/src/features/user/types";

interface PersonnelDetailDrawerProps {
  user: UserListItem | null;
  isUpdating: boolean;
  onClose: () => void;
  onSave: (id: number, body: UserUpdateRequest) => void;
}

// 직원 상세 + 수정 + 출입 이력 드로어.
// 출입 이력은 features/user 의 useUserAccessLogs hook 사용 (C9 에서 features/accesslog 로 이관 예정).
export function PersonnelDetailDrawer({
  user,
  isUpdating,
  onClose,
  onSave,
}: PersonnelDetailDrawerProps) {
  const [tab, setTab] = useState<"info" | "access">("info");
  const { data: departmentsData } = useDepartments();
  const departments = departmentsData ?? [];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const departmentId = Number(formData.get("departmentId"));
    const body: UserUpdateRequest = {
      name: String(formData.get("name") ?? "").trim() || undefined,
      role: (formData.get("role") as string) || undefined,
      position: String(formData.get("position") ?? "").trim() || undefined,
      departmentId: Number.isFinite(departmentId) && departmentId > 0 ? departmentId : undefined,
      phone: (formData.get("phone") as string) || undefined,
    };
    onSave(user.id, body);
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border-gray-100 text-black max-w-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{user?.name ?? ""} 직원 상세</DialogTitle>
          <DialogDescription className="text-gray-400">
            {user ? `사번: ${user.employeeNumber} · ${user.email}` : ""}
          </DialogDescription>
        </DialogHeader>

        {user && (
          <>
            <div className="flex items-center gap-2 border-b border-gray-100">
              <TabButton active={tab === "info"} onClick={() => setTab("info")}>
                기본 정보
              </TabButton>
              <TabButton active={tab === "access"} onClick={() => setTab("access")}>
                출입 이력
              </TabButton>
            </div>

            {tab === "info" ? (
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">이름</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      defaultValue={user.name}
                      required
                      className="bg-gray-50 border-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>사번</Label>
                    <Input value={user.employeeNumber} disabled className="bg-gray-100 border-gray-100 text-gray-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">역할</Label>
                    <Select name="role" defaultValue={user.role}>
                      <SelectTrigger className="bg-gray-50 border-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-100 text-black">
                        <SelectItem value="USER">USER</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-position">직급</Label>
                    <Input
                      id="edit-position"
                      name="position"
                      defaultValue={user.position}
                      className="bg-gray-50 border-gray-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-dept">부서</Label>
                    <Select
                      name="departmentId"
                      defaultValue={
                        departments.find((d) => d.name === user.department)
                          ? String(departments.find((d) => d.name === user.department)!.id)
                          : departments[0]
                            ? String(departments[0].id)
                            : ""
                      }
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-100">
                        <SelectValue placeholder="부서 선택" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-100 text-black">
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">연락처</Label>
                    <Input
                      id="edit-phone"
                      name="phone"
                      defaultValue={user.phone ?? ""}
                      placeholder="010-0000-0000"
                      className="bg-gray-50 border-gray-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>이메일</Label>
                    <Input value={user.email} disabled className="bg-gray-100 border-gray-100 text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <Label>입사일</Label>
                    <Input value={user.hiredAt} disabled className="bg-gray-100 border-gray-100 text-gray-500" />
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400">
                    취소
                  </Button>
                  <Button type="submit" disabled={isUpdating} className="bg-black text-white hover:bg-black/90">
                    {isUpdating ? "수정 중..." : "수정 완료"}
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <AccessLogsSection userId={user.id} />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-3 text-sm font-bold transition-colors border-b-2",
        active ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-700",
      )}
    >
      {children}
    </button>
  );
}

function AccessLogsSection({ userId }: { userId: number }) {
  const { data, isLoading, isError, error } = useUserAccessLogs(userId, { page: 0, size: 10 });

  if (isLoading) {
    return (
      <div className="py-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <div className="py-6 text-sm font-bold text-red-500">
        출입 이력을 불러오지 못했습니다: {error?.message ?? ""}
      </div>
    );
  }
  if (!data || data.logs.length === 0) {
    return <p className="py-12 text-center text-gray-400">출입 이력이 없습니다.</p>;
  }

  return (
    <div className="py-4 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
      {data.logs.map((log) => (
        <div
          key={log.id}
          className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100"
        >
          <div>
            <p className="text-sm font-bold text-gray-900">{log.zoneName}</p>
            <p className="text-[10px] text-gray-400 font-medium">{log.deviceName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-700">{new Date(log.taggedAt).toLocaleString()}</p>
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                log.direction === "IN"
                  ? "bg-green-100 text-green-600"
                  : "bg-orange-100 text-orange-600",
              )}
            >
              {log.direction === "IN" ? "입장" : "퇴장"}
            </span>
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400 text-center pt-2">최근 {data.logs.length}건 · 전체 {data.totalElements}건</p>
    </div>
  );
}
