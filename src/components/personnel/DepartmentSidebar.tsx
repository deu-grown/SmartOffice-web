import { Users } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDepartments } from "@/src/features/department/hooks";

interface DepartmentSidebarProps {
  selectedDepartment: string;
  onSelect: (deptName: string) => void;
}

// 부서 필터 — chip row 형태로 PersonnelTable 컨테이너 상단에 배치한다.
// PersonnelListTable 내부 부서 Select 를 대체하는 컴포넌트.
// "전체" 칩 + 부서별 칩(인원수 포함). C6 user features 도입 시 부서 ID 기반으로 정합.
export function DepartmentSidebar({ selectedDepartment, onSelect }: DepartmentSidebarProps) {
  const { data, isLoading, isError, error } = useDepartments();

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white p-4 rounded-3xl border border-red-100 shadow-sm">
        <p className="text-sm font-bold text-red-500">
          부서 목록을 불러오지 못했습니다: {error?.message ?? ""}
        </p>
      </div>
    );
  }

  const departments = data ?? [];

  return (
    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex items-center flex-wrap gap-2">
        <DepartmentChip
          label="전체"
          isSelected={selectedDepartment === "전체"}
          onClick={() => onSelect("전체")}
        />
        {departments.map((dept) => (
          <DepartmentChip
            key={dept.id}
            label={dept.name}
            count={dept.userCount}
            isSelected={selectedDepartment === dept.name}
            onClick={() => onSelect(dept.name)}
          />
        ))}
      </div>
    </div>
  );
}

function DepartmentChip({
  label,
  count,
  isSelected,
  onClick,
}: {
  label: string;
  count?: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 h-10 rounded-xl text-xs font-bold transition-colors",
        isSelected
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-600 hover:bg-gray-100",
      )}
    >
      <Users className="w-3.5 h-3.5" />
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px]",
            isSelected ? "bg-white/20 text-white" : "bg-white text-gray-500",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
