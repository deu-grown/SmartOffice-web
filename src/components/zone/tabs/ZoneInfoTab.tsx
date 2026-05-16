// 구역 상세 - 기본 정보 탭.
// 묶음 2 커밋 2.2 mock 제거: ZoneListItemResponse 6 필드 표시.
// gateActive/permissions/groups/floor 모델은 백엔드 zone 도메인 부재 → 본 탭에서 표시 안 함.
import { Layers, MapPin, Hash, Calendar, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ZoneListItem, ZoneType } from "@/src/features/zone/types";

interface ZoneInfoTabProps {
  zone: ZoneListItem | undefined;
  parentZone: ZoneListItem | undefined;
  isLoading: boolean;
}

/** ZoneType enum 한국어 라벨 (FLOOR=층 / AREA=구역 / ROOM=방). */
export function zoneTypeLabel(t: ZoneType): string {
  switch (t) {
    case "FLOOR":
      return "층";
    case "AREA":
      return "구역";
    case "ROOM":
      return "방";
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}

export function ZoneInfoTab({ zone, parentZone, isLoading }: ZoneInfoTabProps) {
  if (isLoading) {
    return (
      <div className="bg-surface p-8 rounded-2xl border border-border shadow-[var(--shadow-card)] space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!zone) {
    return (
      <div className="bg-surface p-8 rounded-2xl border border-border shadow-[var(--shadow-card)]">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground text-sm">구역을 선택해 주세요.</p>
        </div>
      </div>
    );
  }

  const rows = [
    {
      icon: Hash,
      label: "구역 ID",
      value: zone.id,
    },
    {
      icon: Layers,
      label: "유형",
      value: zoneTypeLabel(zone.zoneType),
    },
    {
      icon: MapPin,
      label: "상위 구역",
      value: zone.parentId === null ? "(최상위)" : parentZone ? `${parentZone.name} · ${zoneTypeLabel(parentZone.zoneType)}` : `#${zone.parentId}`,
    },
    {
      icon: FileText,
      label: "설명",
      value: zone.description ?? "—",
    },
    {
      icon: Calendar,
      label: "등록일",
      value: formatDate(zone.createdAt),
    },
  ];

  return (
    <div className="bg-surface p-8 rounded-2xl border border-border shadow-[var(--shadow-card)] space-y-6">
      <h3 className="text-lg font-bold text-foreground">기본 정보</h3>
      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-4 py-3 border-b border-border last:border-b-0">
            <div className="w-10 h-10 bg-surface-2 rounded-xl flex items-center justify-center">
              <r.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-[0.07em] mb-0.5">{r.label}</p>
              <p className="text-base font-bold text-foreground break-words">{r.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
