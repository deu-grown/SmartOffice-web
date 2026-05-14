import { Users } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDepartments } from "@/src/features/department/hooks";

interface DepartmentSidebarProps {
  selectedDepartmentId: number | null;
  onSelect: (id: number | null) => void;
}

// 부서 필터 — chip row 형태. 백엔드 부서 ID 기준.
// C5 에서 placeholder → 실 컴포넌트로 활성화. C6 에서 부서 ID 기반으로 정합 (백엔드 useUsers 의 departmentId 필터와 매칭).
export function DepartmentSidebar({ selectedDepartmentId, onSelect }: DepartmentSidebarProps) {
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
          isSelected={selectedDepartmentId === null}
          onClick={() => onSelect(null)}
        />
        {departments.map((dept) => (
          <DepartmentChip
            key={dept.id}
            label={dept.name}
            count={dept.userCount}
            isSelected={selectedDepartmentId === dept.id}
            onClick={() => onSelect(dept.id)}
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
