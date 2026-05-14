// 주차장 구역별 요약(총/점유/여유 카드 + spot 리스트) — 묶음 3 분할 시점 placeholder.
// 묶음 4 흡수 시점에 useParkingZoneSummary(zoneId) hook 으로 활성화. ParkingZoneSummaryResponse 기반 카드 그리드.
export function ParkingZoneSummary() {
  return (
    <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm text-center text-sm text-gray-400">
      구역별 요약은 묶음 4 에서 활성화됩니다.
    </div>
  );
}
