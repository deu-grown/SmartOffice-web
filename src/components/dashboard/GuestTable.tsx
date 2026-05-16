// 방문객 관리 페이지 — features/guest 실 API 연동. mock 전면 제거.
// 사이드바 메뉴 복구 완료 (백엔드 sprint 묶음 5 #1 guest 도메인 신설).
import { useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Trash2,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  useCheckInGuest,
  useCheckOutGuest,
  useCreateGuest,
  useDeleteGuest,
  useGuests,
} from "@/src/features/guest/hooks";
import type { GuestFilter, GuestStatus } from "@/src/features/guest/types";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: "all" | GuestStatus; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "SCHEDULED", label: "방문 예정" },
  { value: "VISITING", label: "방문 중" },
  { value: "COMPLETED", label: "방문 완료" },
  { value: "CANCELLED", label: "취소됨" },
];

const STATUS_STYLE: Record<GuestStatus, { label: string; className: string }> = {
  SCHEDULED: { label: "방문 예정", className: "bg-warning-bg text-warning-fg" },
  VISITING: { label: "방문 중", className: "bg-success-bg text-success-fg" },
  COMPLETED: { label: "방문 완료", className: "bg-info-bg text-info-fg" },
  CANCELLED: { label: "취소됨", className: "bg-surface-2 text-muted-foreground" },
};

export function GuestTable() {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | GuestStatus>("all");
  const [page, setPage] = useState(0);

  // 등록 모달 상태
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCompany, setAddCompany] = useState("");
  const [addPurpose, setAddPurpose] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addHostId, setAddHostId] = useState("");
  const [addScheduled, setAddScheduled] = useState("");

  const filter: GuestFilter = {
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(keyword.trim() && { keyword: keyword.trim() }),
    page,
    size: PAGE_SIZE,
  };

  const query = useGuests(filter);
  const data = query.data;
  const rows = data?.guests ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = Math.max(data?.totalPages ?? 1, 1);

  const createMutation = useCreateGuest();
  const deleteMutation = useDeleteGuest();
  const checkInMutation = useCheckInGuest();
  const checkOutMutation = useCheckOutGuest();

  // 현재 페이지 기준 통계
  const scheduledCount = rows.filter((r) => r.guestStatus === "SCHEDULED").length;
  const visitingCount = rows.filter((r) => r.guestStatus === "VISITING").length;
  const completedCount = rows.filter((r) => r.guestStatus === "COMPLETED").length;

  const resetAddForm = () => {
    setAddName("");
    setAddCompany("");
    setAddPurpose("");
    setAddPhone("");
    setAddHostId("");
    setAddScheduled("");
  };

  const handleCreate = () => {
    if (!addName.trim() || !addCompany.trim() || !addPurpose.trim() || !addHostId || !addScheduled) {
      toast.error("필수 항목을 모두 입력해 주세요.");
      return;
    }
    createMutation.mutate(
      {
        guestName: addName.trim(),
        company: addCompany.trim(),
        hostUserId: Number(addHostId),
        purpose: addPurpose.trim(),
        contactPhone: addPhone.trim() || null,
        scheduledEntryAt: addScheduled,
      },
      {
        onSuccess: () => {
          toast.success("방문객이 등록되었습니다.");
          setIsAddOpen(false);
          resetAddForm();
          setPage(0);
        },
        onError: (err: Error) => toast.error(err.message || "등록에 실패했습니다."),
      },
    );
  };

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`'${name}' 방문객을 삭제하시겠습니까?`)) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("방문객이 삭제되었습니다."),
      onError: (err: Error) => toast.error(err.message || "삭제에 실패했습니다."),
    });
  };

  const handleCheckIn = (id: number, name: string) => {
    checkInMutation.mutate(id, {
      onSuccess: () => toast.success(`${name} 체크인 완료.`),
      onError: (err: Error) => toast.error(err.message || "체크인에 실패했습니다."),
    });
  };

  const handleCheckOut = (id: number, name: string) => {
    checkOutMutation.mutate(id, {
      onSuccess: () => toast.success(`${name} 체크아웃 완료.`),
      onError: (err: Error) => toast.error(err.message || "체크아웃에 실패했습니다."),
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-surface p-8 rounded-4xl border border-border shadow-card">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground">게스트 관리</h1>
          <p className="text-sm font-medium text-muted-foreground">
            방문객 등록 · 체크인/체크아웃 관리
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="h-12 px-6 rounded-2xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          방문객 등록
        </Button>
      </header>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: "방문 예정", value: scheduledCount, icon: Clock, color: "text-warning-fg", bg: "bg-warning-bg" },
          { label: "방문 중", value: visitingCount, icon: Users, color: "text-success-fg", bg: "bg-success-bg" },
          { label: "방문 완료", value: completedCount, icon: CheckCircle2, color: "text-info-fg", bg: "bg-surface" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className={cn("p-8 rounded-4xl border border-border shadow-card flex flex-col justify-between h-44", stat.bg)}
            >
              <div className={cn("w-12 h-12 rounded-2xl bg-surface-2 border border-border flex items-center justify-center", stat.color)}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black font-sans uppercase tracking-[0.2em] text-muted-foreground block mb-1">{stat.label}</span>
                <span className={cn("text-3xl font-black tracking-tighter", stat.color)}>{stat.value}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 필터 */}
      <div className="bg-surface p-6 rounded-4xl border border-border shadow-card flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="이름 · 회사명 검색"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
            className="pl-12 h-12 bg-surface-2 border-border rounded-2xl"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v as typeof statusFilter); setPage(0); }}
        >
          <SelectTrigger className="h-12 w-[180px] bg-surface-2 border-border rounded-2xl px-5 font-bold">
            <span>{STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "전체"}</span>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 테이블 */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-card">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-2 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-5">방문객</th>
                <th className="px-6 py-5">회사</th>
                <th className="px-6 py-5">담당자</th>
                <th className="px-6 py-5">방문 목적</th>
                <th className="px-6 py-5">예정 시각</th>
                <th className="px-6 py-5">상태</th>
                <th className="px-6 py-5 text-right">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : query.isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm font-bold text-error-fg">
                    방문객 목록을 불러오지 못했습니다.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    조건에 맞는 방문객이 없습니다.
                  </td>
                </tr>
              ) : (
                rows.map((g) => {
                  const s = STATUS_STYLE[g.guestStatus];
                  return (
                    <tr key={g.guestId} className="hover:bg-surface-2">
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-foreground">{g.guestName}</span>
                          {g.contactPhone && (
                            <span className="block text-[10px] text-muted-foreground">{g.contactPhone}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{g.company}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{g.hostUserName}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{g.purpose}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(g.scheduledEntryAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={cn("border-none px-3 py-1 rounded-full text-[10px] font-bold", s.className)}>
                          {s.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {g.guestStatus === "SCHEDULED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 rounded-xl text-xs font-bold border-success-bg text-success-fg hover:bg-success-bg"
                              onClick={() => handleCheckIn(g.guestId, g.guestName)}
                              disabled={checkInMutation.isPending}
                            >
                              <LogIn className="w-3 h-3 mr-1" />
                              체크인
                            </Button>
                          )}
                          {g.guestStatus === "VISITING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 rounded-xl text-xs font-bold border-info-bg text-info-fg hover:bg-info-bg"
                              onClick={() => handleCheckOut(g.guestId, g.guestName)}
                              disabled={checkOutMutation.isPending}
                            >
                              <LogOut className="w-3 h-3 mr-1" />
                              체크아웃
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-error-fg hover:bg-error-bg"
                            onClick={() => handleDelete(g.guestId, g.guestName)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-sm text-muted-foreground">
            전체 <span className="font-bold text-foreground">{totalElements}</span>명 · 페이지 {page + 1}/{totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => setPage(Math.max(page - 1, 0))} disabled={page === 0} className="w-10 h-10 rounded-xl border-border disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setPage(Math.min(page + 1, totalPages - 1))} disabled={page >= totalPages - 1} className="w-10 h-10 rounded-xl border-border disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 등록 모달 */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-foreground/60 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-surface rounded-4xl w-full max-w-md p-10 shadow-overlay space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold text-foreground">방문객 등록</h2>
              <p className="text-muted-foreground font-medium mt-1">방문 예정 정보를 입력하세요.</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground ml-1">이름 *</label>
                  <Input value={addName} onChange={(e) => setAddName(e.target.value)} className="h-12 rounded-2xl border-border bg-surface-2 px-5" placeholder="홍길동" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground ml-1">회사 *</label>
                  <Input value={addCompany} onChange={(e) => setAddCompany(e.target.value)} className="h-12 rounded-2xl border-border bg-surface-2 px-5" placeholder="ABC 주식회사" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground ml-1">방문 목적 *</label>
                <Input value={addPurpose} onChange={(e) => setAddPurpose(e.target.value)} className="h-12 rounded-2xl border-border bg-surface-2 px-5" placeholder="사업 미팅" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground ml-1">담당자 ID *</label>
                  <Input value={addHostId} onChange={(e) => setAddHostId(e.target.value)} type="number" className="h-12 rounded-2xl border-border bg-surface-2 px-5" placeholder="2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground ml-1">연락처</label>
                  <Input value={addPhone} onChange={(e) => setAddPhone(e.target.value)} className="h-12 rounded-2xl border-border bg-surface-2 px-5" placeholder="010-0000-0000" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground ml-1">방문 예정 시각 *</label>
                <Input value={addScheduled} onChange={(e) => setAddScheduled(e.target.value)} type="datetime-local" className="h-12 rounded-2xl border-border bg-surface-2 px-5" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setIsAddOpen(false); resetAddForm(); }} disabled={createMutation.isPending} className="flex-1 h-14 rounded-2xl font-bold text-muted-foreground hover:text-foreground hover:bg-surface-2">취소</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="flex-1 h-14 rounded-2xl font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                {createMutation.isPending ? "등록 중..." : "등록하기"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
