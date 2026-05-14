// 급여 기준 표 - 직급별 기본급/초과배율/야간배율/적용기간.
// 묶음 3 커밋 3.1 β 분할 (placeholder). 커밋 3.2 에서 features/salary 흡수.
import { Briefcase } from "lucide-react";

export function SalarySettingsTable() {
  return (
    <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Briefcase className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">급여 기준 관리</h3>
        <p className="text-gray-400 text-sm max-w-[260px]">
          직급별 기본급·초과배율·야간배율을 관리합니다. (커밋 3.2 에서 활성화)
        </p>
      </div>
    </div>
  );
}
