// 재고/자산 관리 페이지 (G8). 플랜 3-3 묶음 2 에서 mock 제거 후 features/asset 으로 마이그레이션.
// 백엔드 모델은 단순 자산 대장 — status 3종(ACTIVE/INACTIVE/LOST) + category(String free-form, ASSET_CATEGORIES 6종 Select: 백엔드 시드 5종 + "기타").
// mock 의 보안 추적 모델(authorizedArea/lastGate/rfidTag/보안 위반 상태)은 백엔드 부재로 모두 제거.
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Package,
  CheckCircle2,
  Archive,
  XCircle,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  AlertTriangle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  useAssets,
  useCreateAsset,
  useDeleteAsset,
  useUpdateAsset,
} from "@/src/features/asset/hooks";
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  ASSET_STATUS_LABELS,
} from "@/src/features/asset/constants";
import type {
  AssetCreateRequest,
  AssetResponse,
  AssetStatus,
  AssetUpdateRequest,
} from "@/src/features/asset/types";

const PAGE_SIZE = 10;

// 상태별 배지 색상 매핑.
const STATUS_BADGE: Record<AssetStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600",
  INACTIVE: "bg-gray-100 text-gray-600",
  LOST: "bg-red-50 text-red-500",
};

interface AssetFormState {
  assetNumber: string;
  assetName: string;
  category: string;
  assignedUserId: string; // 빈 문자열 = null
  description: string;
  assetStatus: AssetStatus;
  purchasedAt: string; // YYYY-MM-DD 또는 빈 문자열
}

const emptyForm = (): AssetFormState => ({
  assetNumber: "",
  assetName: "",
  category: "",
  assignedUserId: "",
  description: "",
  assetStatus: "ACTIVE",
  purchasedAt: "",
});

const toCreateRequest = (form: AssetFormState): AssetCreateRequest => ({
  assetNumber: form.assetNumber.trim(),
  assetName: form.assetName.trim(),
  category: form.category.trim(),
  assignedUserId: form.assignedUserId.trim() ? Number(form.assignedUserId) : null,
  description: form.description.trim() ? form.description.trim() : null,
  assetStatus: form.assetStatus,
  purchasedAt: form.purchasedAt || null,
});

const toUpdateRequest = (form: AssetFormState): AssetUpdateRequest => ({
  assetNumber: form.assetNumber.trim(),
  assetName: form.assetName.trim(),
  category: form.category.trim(),
  assignedUserId: form.assignedUserId.trim() ? Number(form.assignedUserId) : null,
  description: form.description.trim() ? form.description.trim() : null,
  assetStatus: form.assetStatus,
  purchasedAt: form.purchasedAt || null,
});

const fromAsset = (a: AssetResponse): AssetFormState => ({
  assetNumber: a.assetNumber,
  assetName: a.assetName,
  category: a.category,
  assignedUserId: a.assignedUserId !== null ? String(a.assignedUserId) : "",
  description: a.description ?? "",
  assetStatus: a.assetStatus,
  purchasedAt: a.purchasedAt ?? "",
});

export function InventoryManagement() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | AssetStatus>("ALL");

  const [registerOpen, setRegisterOpen] = useState(false);
  const [newForm, setNewForm] = useState<AssetFormState>(emptyForm());

  const [editTarget, setEditTarget] = useState<AssetResponse | null>(null);
  const [editForm, setEditForm] = useState<AssetFormState>(emptyForm());

  const [deleteTarget, setDeleteTarget] = useState<AssetResponse | null>(null);

  // 메인 목록 조회.
  const listQuery = useAssets({
    category: selectedCategory !== "ALL" ? selectedCategory : undefined,
    status: selectedStatus !== "ALL" ? selectedStatus : undefined,
    keyword: appliedKeyword.trim() || undefined,
    page,
    size: PAGE_SIZE,
  });

  // Stat 4종 (status 별 totalElements).
  // 별도 통계 엔드포인트가 없어 4번 호출 (size=1) — 캐시 활용으로 트래픽 부담 적음.
  const totalStat = useAssets({ page: 0, size: 1 });
  const activeStat = useAssets({ status: "ACTIVE", page: 0, size: 1 });
  const inactiveStat = useAssets({ status: "INACTIVE", page: 0, size: 1 });
  const lostStat = useAssets({ status: "LOST", page: 0, size: 1 });

  const stats = useMemo(
    () => ({
      total: totalStat.data?.totalElements ?? 0,
      active: activeStat.data?.totalElements ?? 0,
      inactive: inactiveStat.data?.totalElements ?? 0,
      lost: lostStat.data?.totalElements ?? 0,
    }),
    [totalStat.data, activeStat.data, inactiveStat.data, lostStat.data],
  );

  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset();
  const deleteMutation = useDeleteAsset();

  const items = listQuery.data?.content ?? [];
  const totalPages = listQuery.data?.totalPages ?? 1;
  const totalElements = listQuery.data?.totalElements ?? 0;

  const handleSearch = () => {
    setAppliedKeyword(searchQuery);
    setPage(0);
  };

  const handleCardClick = (status: "ALL" | AssetStatus) => {
    setSelectedStatus(status);
    setPage(0);
  };

  const handleRegister = () => {
    if (!newForm.assetNumber || !newForm.assetName || !newForm.category) {
      toast.error("자산 번호 · 자산명 · 카테고리는 필수입니다.");
      return;
    }
    createMutation.mutate(toCreateRequest(newForm), {
      onSuccess: () => {
        toast.success("신규 자산이 등록되었습니다.");
        setRegisterOpen(false);
        setNewForm(emptyForm());
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "자산 등록 실패");
      },
    });
  };

  const openEdit = (asset: AssetResponse) => {
    setEditTarget(asset);
    setEditForm(fromAsset(asset));
  };

  const handleSaveEdit = () => {
    if (!editTarget) return;
    if (!editForm.assetNumber || !editForm.assetName || !editForm.category) {
      toast.error("자산 번호 · 자산명 · 카테고리는 필수입니다.");
      return;
    }
    updateMutation.mutate(
      { id: editTarget.assetId, body: toUpdateRequest(editForm) },
      {
        onSuccess: () => {
          toast.success("자산 정보가 수정되었습니다.");
          setEditTarget(null);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "자산 수정 실패");
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.assetId, {
      onSuccess: () => {
        toast.success("자산이 삭제되었습니다.");
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "자산 삭제 실패");
      },
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">재고 및 자산 관리</h1>
          <p className="text-sm font-medium text-gray-500">
            자산 = 재고 품목 (구입·할당·상태 관리). 장치 = 구역 설치 IoT (구역 관리 페이지 참조).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="자산 번호 또는 자산명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="w-[280px] h-10 pl-10 bg-white border-none rounded-xl text-sm focus:ring-2 focus:ring-black/5"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="h-10 px-6 bg-zinc-900 text-white rounded-xl font-bold shadow-md hover:bg-black transition-colors"
            >
              검색
            </Button>
            <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
              <DialogTrigger
                render={
                  <Button
                    variant="outline"
                    className="h-10 px-6 rounded-xl border-gray-200 font-bold gap-2"
                  />
                }
              >
                <Plus className="w-4 h-4" />
                자산 신규 등록
              </DialogTrigger>
              <DialogContent className="sm:max-w-[560px] bg-white rounded-[32px] p-10 border-none shadow-2xl">
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-2xl font-black">자산 신규 등록</DialogTitle>
                  <DialogDescription className="text-gray-500 font-medium">
                    자산 대장에 새로운 항목을 등록합니다.
                  </DialogDescription>
                </DialogHeader>
                <AssetFormFields form={newForm} onChange={setNewForm} />
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
                    {createMutation.isPending ? "등록 중..." : "자산 등록하기"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Summary Cards (status 4종) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            id: "ALL" as const,
            label: "전체 자산",
            value: stats.total,
            icon: Package,
            color: "text-zinc-700",
            bg: "bg-white",
            ring: "ring-zinc-500",
          },
          {
            id: "ACTIVE" as const,
            label: ASSET_STATUS_LABELS.ACTIVE,
            value: stats.active,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50/40 border-emerald-100",
            ring: "ring-emerald-500",
          },
          {
            id: "INACTIVE" as const,
            label: ASSET_STATUS_LABELS.INACTIVE,
            value: stats.inactive,
            icon: Archive,
            color: "text-gray-600",
            bg: "bg-white",
            ring: "ring-gray-400",
          },
          {
            id: "LOST" as const,
            label: ASSET_STATUS_LABELS.LOST,
            value: stats.lost,
            icon: XCircle,
            color: "text-red-500",
            bg: "bg-red-50/40 border-red-100",
            ring: "ring-red-500",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          const isActive = selectedStatus === stat.id;
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleCardClick(stat.id)}
              className={cn(
                "p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between h-44 cursor-pointer group transition-all hover:scale-[1.02] active:scale-[0.98]",
                stat.bg,
                isActive ? `ring-2 ${stat.ring} border-transparent` : "",
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 border border-gray-100 group-hover:scale-110 transition-transform",
                    stat.color,
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black font-sans uppercase tracking-[0.2em] text-gray-400 block mb-1">
                  {stat.label}
                </span>
                <span className={cn("text-3xl font-black tracking-tighter", stat.color)}>
                  {stat.value}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Table */}
      <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-black">자산 리스트</h3>
            <span className="text-xs font-bold text-gray-400">총 {totalElements}건</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={selectedCategory}
              onValueChange={(v) => {
                setSelectedCategory(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[160px] h-10 bg-gray-50 border-none rounded-xl text-xs font-bold px-4">
                {selectedCategory === "ALL" ? (
                  <span>모든 카테고리</span>
                ) : (
                  <span>{selectedCategory}</span>
                )}
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100 rounded-xl font-bold">
                <SelectItem value="ALL">모든 카테고리</SelectItem>
                {ASSET_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedStatus}
              onValueChange={(v) => {
                setSelectedStatus(v as "ALL" | AssetStatus);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[160px] h-10 bg-gray-50 border-none rounded-xl text-xs font-bold px-4">
                {selectedStatus === "ALL" ? (
                  <span>모든 상태</span>
                ) : (
                  <span>{ASSET_STATUS_LABELS[selectedStatus]}</span>
                )}
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100 rounded-xl font-bold">
                <SelectItem value="ALL">모든 상태</SelectItem>
                {ASSET_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {ASSET_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                  자산 번호
                </th>
                <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                  자산명
                </th>
                <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                  카테고리
                </th>
                <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                  담당자
                </th>
                <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                  구매일
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
              {items.map((a, i) => (
                <motion.tr
                  key={a.assetId}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-5 px-2 font-mono text-xs font-bold text-gray-400">
                    {a.assetNumber}
                  </td>
                  <td className="py-5 px-2">
                    <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {a.assetName}
                    </span>
                  </td>
                  <td className="py-5 px-2">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100/50 px-2.5 py-1 rounded-lg">
                      {a.category}
                    </span>
                  </td>
                  <td className="py-5 px-2 text-sm font-medium text-gray-600">
                    {a.assignedUserName ?? "—"}
                  </td>
                  <td className="py-5 px-2 text-sm font-mono text-gray-500">
                    {a.purchasedAt ?? "—"}
                  </td>
                  <td className="py-5 px-2">
                    <Badge
                      className={cn(
                        "rounded-lg font-bold border-none px-3 py-1 text-[11px]",
                        STATUS_BADGE[a.assetStatus],
                      )}
                    >
                      {ASSET_STATUS_LABELS[a.assetStatus]}
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
                            자산 관리
                          </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-gray-100 mb-1" />
                        <DropdownMenuItem
                          className="rounded-xl px-3 py-2 font-bold cursor-pointer hover:bg-gray-50 outline-none"
                          onClick={() => openEdit(a)}
                        >
                          자산 수정
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100 my-1" />
                        <DropdownMenuItem
                          className="rounded-xl px-3 py-2 font-bold cursor-pointer text-red-500 hover:bg-red-50"
                          onClick={() => setDeleteTarget(a)}
                        >
                          자산 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {!listQuery.isLoading && items.length === 0 && (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-200" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">
                {appliedKeyword || selectedCategory !== "ALL" || selectedStatus !== "ALL"
                  ? "검색 결과가 없습니다"
                  : "등록된 자산이 없습니다"}
              </h4>
              <p className="text-gray-400 text-sm">
                {appliedKeyword || selectedCategory !== "ALL" || selectedStatus !== "ALL"
                  ? "필터 조건을 다시 확인해주세요."
                  : "신규 등록 버튼으로 자산을 추가하세요."}
              </p>
            </div>
          )}
          {listQuery.isLoading && (
            <div className="py-20 text-center text-gray-400 text-sm">자산 목록 불러오는 중...</div>
          )}
          {listQuery.isError && (
            <div className="py-20 text-center text-red-500 text-sm">
              자산 목록 조회 중 오류가 발생했습니다.
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-50">
            <p className="text-xs font-bold text-gray-400">
              총 {totalElements}개 ({page + 1} / {totalPages} 페이지)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-lg border-gray-100"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "ghost"}
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-8 h-8 rounded-lg font-bold text-xs p-0",
                      p === page ? "bg-zinc-900 text-white" : "text-gray-400",
                    )}
                  >
                    {p + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-lg border-gray-100"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page + 1 >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
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
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-black">자산 정보 수정</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              {editTarget?.assetName}
            </DialogDescription>
          </DialogHeader>
          <AssetFormFields form={editForm} onChange={setEditForm} />
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

      {/* Delete Confirm Dialog */}
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
            <DialogTitle className="text-xl font-black text-center">자산 삭제 확인</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium text-center">
              <span className="font-bold text-gray-900">{deleteTarget?.assetName}</span> 자산을
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

// 자산 등록/수정 공용 폼 필드.
function AssetFormFields({
  form,
  onChange,
}: {
  form: AssetFormState;
  onChange: (next: AssetFormState) => void;
}) {
  return (
    <div className="space-y-6 py-6 font-sans">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
            자산 번호
          </Label>
          <Input
            value={form.assetNumber}
            onChange={(e) => onChange({ ...form, assetNumber: e.target.value })}
            placeholder="AST-001"
            className="h-12 bg-gray-50 border-none rounded-2xl px-5 font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
            카테고리
          </Label>
          <Select
            value={form.category}
            onValueChange={(val) => onChange({ ...form, category: val })}
          >
            <SelectTrigger className="h-12 bg-gray-50 border-none rounded-2xl px-5 font-bold">
              {form.category ? <span>{form.category}</span> : <SelectValue placeholder="카테고리 선택" />}
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100 rounded-2xl font-bold">
              {ASSET_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
          자산명
        </Label>
        <Input
          value={form.assetName}
          onChange={(e) => onChange({ ...form, assetName: e.target.value })}
          placeholder="자산 이름을 입력하세요"
          className="h-14 bg-gray-50 border-none rounded-2xl px-6 focus:ring-2 focus:ring-black/5 font-bold text-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
            상태
          </Label>
          <Select
            value={form.assetStatus}
            onValueChange={(val) => onChange({ ...form, assetStatus: val as AssetStatus })}
          >
            <SelectTrigger className="h-12 bg-gray-50 border-none rounded-2xl px-5 font-bold">
              <span>{ASSET_STATUS_LABELS[form.assetStatus]}</span>
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100 rounded-2xl font-bold">
              {ASSET_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {ASSET_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
            구매일
          </Label>
          <Input
            type="date"
            value={form.purchasedAt}
            onChange={(e) => onChange({ ...form, purchasedAt: e.target.value })}
            className="h-12 bg-gray-50 border-none rounded-2xl px-5 font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
          담당자 사번 ID (선택)
        </Label>
        <Input
          value={form.assignedUserId}
          onChange={(e) => onChange({ ...form, assignedUserId: e.target.value })}
          placeholder="예: 1 (담당자 미지정 시 비워두세요)"
          className="h-12 bg-gray-50 border-none rounded-2xl px-5 font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
          설명 (선택)
        </Label>
        <Input
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder="자산 메모 (예: 임원용 노트북)"
          className="h-12 bg-gray-50 border-none rounded-2xl px-5"
        />
      </div>
    </div>
  );
}
