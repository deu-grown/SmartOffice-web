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
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-[var(--shadow-card)]">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-[var(--shadow-card)]">
        <p className="text-sm font-bold text-error-fg">
          부서 목록을 불러오지 못했습니다: {error?.message ?? ""}
        </p>
      </div>
    );
  }

  const departments = data ?? [];

  return (
    <div className="bg-surface p-4 rounded-2xl border border-border shadow-[var(--shadow-card)]">
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
        "inline-flex items-center gap-[7px] px-[14px] py-[7px] rounded-full text-[13px] font-medium border transition-colors whitespace-nowrap",
        isSelected
          ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-action)]"
          : "bg-surface border-border text-foreground hover:bg-surface-2",
      )}
    >
      <Users className="w-3.5 h-3.5" />
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={cn(
            "text-[11.5px] font-semibold px-[6px] py-px rounded-full",
            isSelected ? "bg-white/[0.18]" : "bg-black/[0.07]",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
