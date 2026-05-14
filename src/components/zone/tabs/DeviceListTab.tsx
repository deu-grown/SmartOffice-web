// 구역 상세 - 장치 목록 탭.
// 묶음 2 커밋 2.3 에서 features/device 흡수 후 활성화 예정 (placeholder 단계).
import { Package } from "lucide-react";

interface DeviceListTabProps {
  zoneId?: string;
}

export function DeviceListTab(_props: DeviceListTabProps) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Package className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">장치 목록</h3>
        <p className="text-gray-400 text-sm max-w-[260px]">
          본 구역에 설치된 IoT 장치 목록을 표시합니다. (G5 커밋 2.3 에서 활성화)
        </p>
      </div>
    </div>
  );
}
