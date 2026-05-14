// 전력 도메인 상수.
// 임시: POWER 미터 보유 zone 목록 (V7 시드 기반 하드코딩).
//
// 배경: /api/v1/dashboard/sensors/current 는 환경 센서(TEMP/HUMI/CO2) 보유 zone 만
// 반환하므로 회의실 A·B 처럼 POWER 미터만 가진 zone 은 환경 셀렉터에 노출되지 않는다.
// 그 결과 G2 PowerCurrentWidget 이 회의실 A·B 전력을 표시할 수 없는 결함이 발생했다.
//
// TODO[BACKEND_SUGGESTIONS #9]: 백엔드에 GET /api/v1/power/zones 엔드포인트가
// 추가되면 본 상수를 제거하고 hook(usePowerZones 등)으로 전환한다.
export interface PowerZoneOption {
  zoneId: number;
  zoneName: string;
}

export const POWER_ZONES_TEMP: readonly PowerZoneOption[] = [
  { zoneId: 2, zoneName: "회의실 A" },
  { zoneId: 4, zoneName: "회의실 B" },
  { zoneId: 5, zoneName: "개발팀 좌석" },
  { zoneId: 7, zoneName: "서버실" },
] as const;
