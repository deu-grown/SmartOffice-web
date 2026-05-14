import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { AttendanceTab } from "@/src/components/personnel/AttendanceTab";
import { DepartmentSidebar } from "@/src/components/personnel/DepartmentSidebar";
import { MyProfileSection } from "@/src/components/personnel/MyProfileSection";
import {
  PERSONNEL_PAGE_SIZE,
  PersonnelListTable,
} from "@/src/components/personnel/PersonnelListTable";
import { PersonnelDetailDrawer } from "@/src/components/personnel/PersonnelDetailDrawer";

import {
  useCreateUser,
  useDeactivateUser,
  useUpdateUser,
  useUsers,
} from "@/src/features/user/hooks";
import type {
  UserCreateRequest,
  UserListItem,
  UserUpdateRequest,
} from "@/src/features/user/types";

interface PersonnelTableProps {
  // App.tsx 호환을 위해 시그니처만 유지한다 (컨테이너 내부에서 사용하지 않음).
  onTabChange?: (tab: unknown) => void;
}

// 인사 페이지 컨테이너.
// 상단 탭(직원 목록 / 근태 관리) 전환 + 부서 사이드바 + 직원 목록(서버 페이지네이션)
// + 상세/수정 드로어(출입 이력 탭 포함). 근태 관리 탭은 AttendanceTab 으로 위임.
type PersonnelView = "personnel" | "attendance" | "myinfo";

// URL 쿼리 ?view=myinfo 등으로 진입 시 해당 탭 자동 선택 — TopBar "내 정보" 메뉴 등 외부 진입점이
// 직접 myinfo 탭으로 navigate 할 수 있도록 동기화.
function viewFromQuery(value: string | null): PersonnelView {
  return value === "myinfo" || value === "attendance" ? value : "personnel";
}

export function PersonnelTable(_props: PersonnelTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState<PersonnelView>(() =>
    viewFromQuery(searchParams.get("view")),
  );
  // 쿼리 변경(브라우저 back/forward, 외부 link) 시 탭 동기화.
  useEffect(() => {
    const next = viewFromQuery(searchParams.get("view"));
    setActiveView((prev) => (prev === next ? prev : next));
  }, [searchParams]);
  const handleViewChange = (next: PersonnelView) => {
    setActiveView(next);
    const params = new URLSearchParams(searchParams);
    if (next === "personnel") params.delete("view");
    else params.set("view", next);
    setSearchParams(params, { replace: true });
  };
  const [filterDepartmentId, setFilterDepartmentId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);

  const usersQuery = useUsers({
    departmentId: filterDepartmentId ?? undefined,
    status: filterStatus !== "전체" ? filterStatus : undefined,
    keyword: searchKeyword || undefined,
    page,
    size: PERSONNEL_PAGE_SIZE,
  });

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deactivateMutation = useDeactivateUser();

  const handleAddUser = (body: UserCreateRequest) => {
    createMutation.mutate(body, {
      onSuccess: () => toast.success("신규 직원이 등록되었습니다."),
      onError: (err) => toast.error(err?.message ?? "직원 등록에 실패했습니다."),
    });
  };

  const handleDeleteUser = (id: number, name: string) => {
    deactivateMutation.mutate(id, {
      onSuccess: () => toast.success(`${name} 직원이 퇴사 처리되었습니다.`),
      onError: (err) => toast.error(err?.message ?? "퇴사 처리에 실패했습니다."),
    });
  };

  const handleSaveEdited = (id: number, body: UserUpdateRequest) => {
    updateMutation.mutate(
      { id, body },
      {
        onSuccess: () => {
          toast.success("직원 정보가 수정되었습니다.");
          setEditingUser(null);
        },
        onError: (err) => toast.error(err?.message ?? "직원 정보 수정에 실패했습니다."),
      },
    );
  };

  const data = usersQuery.data;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 border-b border-gray-100">
        <ViewTabButton
          active={activeView === "personnel"}
          onClick={() => handleViewChange("personnel")}
        >
          직원 목록
        </ViewTabButton>
        <ViewTabButton
          active={activeView === "attendance"}
          onClick={() => handleViewChange("attendance")}
        >
          근태 관리
        </ViewTabButton>
        <ViewTabButton
          active={activeView === "myinfo"}
          onClick={() => handleViewChange("myinfo")}
        >
          내 정보
        </ViewTabButton>
      </div>

      {activeView === "attendance" ? (
        <AttendanceTab />
      ) : activeView === "myinfo" ? (
        <MyProfileSection />
      ) : (
        <>
          <DepartmentSidebar
            selectedDepartmentId={filterDepartmentId}
            onSelect={(id) => {
              setFilterDepartmentId(id);
              setPage(0);
            }}
          />
          <PersonnelListTable
            users={data?.content ?? []}
            totalElements={data?.totalElements ?? 0}
            isLoading={usersQuery.isLoading}
            isError={usersQuery.isError}
            errorMessage={usersQuery.error?.message}
            page={page}
            onPageChange={setPage}
            pageSize={PERSONNEL_PAGE_SIZE}
            totalPages={Math.max(data?.totalPages ?? 1, 1)}
            searchKeyword={searchKeyword}
            onSearchKeywordChange={(kw) => {
              setSearchKeyword(kw);
              setPage(0);
            }}
            filterStatus={filterStatus}
            onFilterStatusChange={(s) => {
              setFilterStatus(s);
              setPage(0);
            }}
            isDepartmentFiltered={filterDepartmentId !== null}
            onResetDepartmentFilter={() => {
              setFilterDepartmentId(null);
              setPage(0);
            }}
            onAddUser={handleAddUser}
            isAdding={createMutation.isPending}
            onDeleteUser={handleDeleteUser}
            onEditUser={setEditingUser}
          />
        </>
      )}

      <PersonnelDetailDrawer
        user={editingUser}
        isUpdating={updateMutation.isPending}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveEdited}
      />
    </div>
  );
}

function ViewTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-5 py-3 text-sm font-bold transition-colors border-b-2",
        active ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-700",
      )}
    >
      {children}
    </button>
  );
}
