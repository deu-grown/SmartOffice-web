import React, { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

import { useMe } from "@/src/features/auth/hooks";
import { useUpdateMyInfo } from "@/src/features/user/hooks";

// cat 5 본인 정보 — GET 은 features/auth.useMe 재사용, POST 만 features/user 신규.
// 성공 시 useUpdateMyInfo 가 authKeys.me() invalidate → useMe 자동 재페치.
export function MyProfileSection() {
  const meQuery = useMe();
  const updateMutation = useUpdateMyInfo();
  const [changePassword, setChangePassword] = useState(false);

  if (meQuery.isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  if (meQuery.isError || !meQuery.data) {
    return (
      <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-8">
        <p className="text-sm font-bold text-red-500">
          본인 정보를 불러오지 못했습니다: {meQuery.error?.message ?? ""}
        </p>
      </div>
    );
  }

  const me = meQuery.data;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const phone = (form.get("phone") as string) || undefined;
    const password = changePassword ? (form.get("password") as string) || undefined : undefined;
    const currentPassword = changePassword
      ? (form.get("currentPassword") as string) || undefined
      : undefined;

    if (changePassword && (!password || !currentPassword)) {
      toast.error("비밀번호 변경 시 현재 비밀번호와 새 비밀번호가 모두 필요합니다.");
      return;
    }

    updateMutation.mutate(
      { phone, password, currentPassword },
      {
        onSuccess: () => {
          toast.success("본인 정보가 수정되었습니다.");
          setChangePassword(false);
        },
        onError: (err) => toast.error(err?.message ?? "정보 수정에 실패했습니다."),
      },
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6 max-w-2xl">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">내 정보</h2>
        <p className="text-sm text-gray-500">
          본인 정보를 조회·수정합니다. 사번/이메일/부서는 관리자에게 문의해 주세요.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <ReadField label="사번" value={me.employeeNumber} />
        <ReadField label="이름" value={me.name} />
        <ReadField label="이메일" value={me.email} />
        <ReadField label="부서" value={me.department} />
        <ReadField label="직급" value={me.position} />
        <ReadField label="입사일" value={me.hiredAt} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-gray-100">
        <div className="space-y-2">
          <Label htmlFor="me-phone">연락처</Label>
          <Input
            id="me-phone"
            name="phone"
            defaultValue={me.phone ?? ""}
            placeholder="010-0000-0000"
            className="bg-gray-50 border-gray-100"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={changePassword}
            onChange={(e) => setChangePassword(e.target.checked)}
            className="h-4 w-4"
          />
          비밀번호 변경
        </label>

        {changePassword && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="me-current">현재 비밀번호</Label>
              <Input
                id="me-current"
                name="currentPassword"
                type="password"
                className="bg-gray-50 border-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="me-new">새 비밀번호 (8자 이상)</Label>
              <Input
                id="me-new"
                name="password"
                type="password"
                className="bg-gray-50 border-gray-100"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-black text-white hover:bg-black/90"
          >
            {updateMutation.isPending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ReadField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-gray-900 font-medium">{value ?? "-"}</p>
    </div>
  );
}
