import React, { useState } from "react";
import {
  Search,
  X,
  UserPlus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { useDepartments } from "@/src/features/department/hooks";
import type {
  UserCreateRequest,
  UserListItem,
} from "@/src/features/user/types";

const ITEMS_PER_PAGE = 10;

interface PersonnelListTableProps {
  users: UserListItem[];
  totalElements: number;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  page: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalPages: number;
  searchKeyword: string;
  onSearchKeywordChange: (kw: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  isDepartmentFiltered: boolean;
  onResetDepartmentFilter: () => void;
  onAddUser: (body: UserCreateRequest) => void;
  isAdding: boolean;
  onDeleteUser: (id: number, name: string) => void;
  onEditUser: (user: UserListItem) => void;
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "재직",
  INACTIVE: "퇴사",
  ON_LEAVE: "휴직",
};

const STATUS_OPTIONS = [
  { value: "전체", label: "전체" },
  { value: "ACTIVE", label: "재직" },
  { value: "INACTIVE", label: "퇴사" },
];

// 직원 목록 영역 — 검색/상태 필터 + 페이지네이션 + 등록 모달 + 표.
// 부서 필터는 DepartmentSidebar 가 상위에서 제어한다.
export function PersonnelListTable({
  users,
  totalElements,
  isLoading,
  isError,
  errorMessage,
  page,
  onPageChange,
  pageSize,
  totalPages,
  searchKeyword,
  onSearchKeywordChange,
  filterStatus,
  onFilterStatusChange,
  isDepartmentFiltered,
  onResetDepartmentFilter,
  onAddUser,
  isAdding,
  onDeleteUser,
  onEditUser,
}: PersonnelListTableProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: departmentsData } = useDepartments();
  const departments = departmentsData ?? [];

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const departmentId = Number(formData.get("departmentId"));
    const body: UserCreateRequest = {
      employeeNumber: String(formData.get("employeeNumber") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      role: String(formData.get("role") ?? "USER"),
      position: String(formData.get("position") ?? "").trim(),
      departmentId,
      phone: (formData.get("phone") as string) || undefined,
      hiredAt: String(formData.get("hiredAt") ?? new Date().toISOString().slice(0, 10)),
    };
    onAddUser(body);
    setIsAddModalOpen(false);
  };

  const startIdx = totalElements === 0 ? 0 : page * pageSize + 1;
  const endIdx = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-3xl">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="이름, 사번, 이메일 검색"
              value={searchKeyword}
              onChange={(e) => onSearchKeywordChange(e.target.value)}
              className="pl-12 bg-surface-2 border-border text-foreground h-12 rounded-2xl focus-visible:ring-ring/30 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={filterStatus} onValueChange={onFilterStatusChange}>
              <SelectTrigger className="w-full md:w-32 h-12 bg-surface-2 border-border rounded-xl shadow-sm">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border text-foreground">
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(isDepartmentFiltered || filterStatus !== "전체" || searchKeyword !== "") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  onSearchKeywordChange("");
                  onResetDepartmentFilter();
                  onFilterStatusChange("전체");
                }}
                className="h-12 w-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger
            render={
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 px-6 font-bold flex items-center gap-2 shadow-[var(--shadow-action)]">
                <UserPlus className="w-4 h-4" />
                직원 등록
              </Button>
            }
          />
          <DialogContent className="bg-surface border-border text-foreground max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">신규 직원 등록</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                필수 항목(사번·이름·이메일·역할·직급·부서·입사일)을 입력해주세요. 초기 비밀번호는 사번입니다.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeNumber">사번</Label>
                  <Input id="employeeNumber" name="employeeNumber" required className="bg-surface-2 border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input id="name" name="name" required className="bg-surface-2 border-border" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" name="email" type="email" required className="bg-surface-2 border-border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">역할</Label>
                  <Select name="role" defaultValue="USER">
                    <SelectTrigger className="bg-surface-2 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border text-foreground">
                      <SelectItem value="USER">USER</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">직급</Label>
                  <Input id="position" name="position" required className="bg-surface-2 border-border" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departmentId">부서</Label>
                  <Select name="departmentId" defaultValue={departments[0] ? String(departments[0].id) : ""}>
                    <SelectTrigger className="bg-surface-2 border-border">
                      <SelectValue placeholder="부서 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border text-foreground">
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hiredAt">입사일</Label>
                  <Input
                    id="hiredAt"
                    name="hiredAt"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="bg-surface-2 border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">연락처</Label>
                <Input id="phone" name="phone" placeholder="010-0000-0000" className="bg-surface-2 border-border" />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground">
                  취소
                </Button>
                <Button type="submit" disabled={isAdding} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {isAdding ? "등록 중..." : "등록 완료"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-2 text-muted-foreground text-[11.5px] font-semibold uppercase tracking-[0.07em]">
                <th className="px-[18px] py-[14px] whitespace-nowrap">직원 정보</th>
                <th className="px-[18px] py-[14px] whitespace-nowrap">부서/직급</th>
                <th className="px-[18px] py-[14px] whitespace-nowrap">이메일</th>
                <th className="px-[18px] py-[14px] whitespace-nowrap">연락처</th>
                <th className="px-[18px] py-[14px] whitespace-nowrap">입사일</th>
                <th className="px-[18px] py-[14px] whitespace-nowrap">상태</th>
                <th className="px-[18px] py-[14px] whitespace-nowrap text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-[18px] py-[14px]">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : isError
                  ? (
                      <tr>
                        <td colSpan={7} className="px-[18px] py-12 text-center text-sm font-bold text-error-fg">
                          직원 목록을 불러오지 못했습니다: {errorMessage ?? ""}
                        </td>
                      </tr>
                    )
                  : users.length === 0
                    ? (
                        <tr>
                          <td colSpan={7} className="px-[18px] py-12 text-center text-muted-foreground">
                            조건에 맞는 직원이 없습니다.
                          </td>
                        </tr>
                      )
                    : users.map((u) => (
                        <tr key={u.id} className="hover:bg-surface-2 transition-colors group">
                          <td className="px-[18px] py-[14px]">
                            <div className="flex flex-col">
                              <span className="text-foreground font-bold">{u.name}</span>
                              <span className="text-muted-foreground text-xs">사번: {u.employeeNumber}</span>
                            </div>
                          </td>
                          <td className="px-[18px] py-[14px]">
                            <div className="flex flex-col">
                              <span className="text-foreground font-medium">{u.department ?? "-"}</span>
                              <span className="text-muted-foreground text-xs">{u.position}</span>
                            </div>
                          </td>
                          <td className="px-[18px] py-[14px] text-muted-foreground text-sm">{u.email}</td>
                          <td className="px-[18px] py-[14px] text-muted-foreground text-sm">{u.phone ?? "-"}</td>
                          <td className="px-[18px] py-[14px] text-muted-foreground text-sm">{u.hiredAt}</td>
                          <td className="px-[18px] py-[14px]">
                            <Badge
                              className={cn(
                                "border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0",
                                u.status === "ACTIVE"
                                  ? "bg-success-bg text-success-fg"
                                  : u.status === "INACTIVE"
                                    ? "bg-error-bg text-error-fg"
                                    : "bg-warning-bg text-warning-fg",
                              )}
                            >
                              {STATUS_LABEL[u.status] ?? u.status}
                            </Badge>
                          </td>
                          <td className="px-[18px] py-[14px] text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2"
                                onClick={() => onEditUser(u)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-lg text-muted-foreground hover:text-error-fg hover:bg-error-bg"
                                onClick={() => onDeleteUser(u.id, u.name)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-sm text-muted-foreground">
            전체 <span className="font-bold text-foreground">{totalElements}</span>명 중 {startIdx}-
            {endIdx} 표시
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(Math.max(page - 1, 0))}
              disabled={page === 0}
              className="w-10 h-10 rounded-xl border-border disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }, (_, i) => {
                if (totalPages > 10) {
                  const isFirstSet = i <= 2;
                  const isLastSet = i >= totalPages - 3;
                  const isMiddle = Math.abs(i - page) <= 1;
                  if (!isFirstSet && !isLastSet && !isMiddle) {
                    if (i === 3 || i === totalPages - 4)
                      return (
                        <span key={i} className="text-muted-foreground px-1">
                          ...
                        </span>
                      );
                    return null;
                  }
                }
                return (
                  <Button
                    key={i}
                    variant={page === i ? "default" : "ghost"}
                    onClick={() => onPageChange(i)}
                    className={cn(
                      "w-10 h-10 rounded-xl font-bold transition-all tabular-nums",
                      page === i
                        ? "bg-primary text-primary-foreground border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-2",
                    )}
                  >
                    {i + 1}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(Math.min(page + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
              className="w-10 h-10 rounded-xl border-border disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// 컨테이너에서 활용하는 페이지 사이즈 상수(상수 변경 시 한 곳만).
export const PERSONNEL_PAGE_SIZE = ITEMS_PER_PAGE;
