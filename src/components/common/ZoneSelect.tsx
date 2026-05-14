// 공용 zone 셀렉터 — shadcn Select(SelectValue) 가 선택된 SelectItem children 을 자동 매핑하지 않고
// raw value(zoneId 문자열) 를 표시하는 결함 회피 위해 SelectTrigger 내부에 명시 텍스트 렌더.
//
// 사용처: PowerCurrentWidget · EnvironmentCard (대시보드) · ZoneListView (FLOOR 셀렉터) · BuildingManagement (zone 셀렉터).
// 향후 G10/G11 zone 셀렉터도 본 컴포넌트 재사용 권장.
//
// 백엔드 #9 (POWER 미터 보유 zone 목록 엔드포인트) 채택 시 PowerCurrentWidget 의 options 만 변경하면 됨 — 단일 지점 수정.
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ZoneSelectOption {
  id: number;
  name: string;
  /** 표시 suffix (예: "(AREA)" · "(ROOM)"). 선택 시·드롭다운 모두에 동일 적용. */
  suffix?: string;
}

interface ZoneSelectProps {
  options: ZoneSelectOption[];
  value: number | undefined;
  onChange: (id: number) => void;
  placeholder?: string;
  /** SelectTrigger className. width/height/색상 customize 용도. */
  triggerClassName?: string;
  /** 옵션 0건일 때 SelectContent 안에 표시할 안내 텍스트. */
  emptyText?: string;
  disabled?: boolean;
}

function formatLabel(o: ZoneSelectOption): string {
  return o.suffix ? `${o.name} ${o.suffix}` : o.name;
}

export function ZoneSelect({
  options,
  value,
  onChange,
  placeholder = "구역 선택",
  triggerClassName,
  emptyText = "조회 가능한 구역이 없습니다.",
  disabled,
}: ZoneSelectProps) {
  const selected = value !== undefined ? options.find((o) => o.id === value) : undefined;

  return (
    <Select
      value={value !== undefined ? String(value) : undefined}
      onValueChange={(v) => onChange(Number(v))}
      disabled={disabled}
    >
      <SelectTrigger className={triggerClassName}>
        {selected ? <span className="truncate">{formatLabel(selected)}</span> : <SelectValue placeholder={placeholder} />}
      </SelectTrigger>
      <SelectContent>
        {options.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-400">{emptyText}</div>
        ) : (
          options.map((o) => (
            <SelectItem key={o.id} value={String(o.id)}>
              {formatLabel(o)}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
