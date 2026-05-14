// 급여 산출 모달 - 위험 액션 (CONFIRMED 는 스킵, DRAFT 는 덮어쓰기).
// 묶음 3 커밋 3.1 β 분할 (placeholder). 커밋 3.2 에서 features/salary useCalculateSalary 흡수 +
// AttendanceBatchTriggerButton 패턴 적용 (① 멱등성 라벨 ② 확인 모달 ③ 결과 모달 ④ 실패 토스트).
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SalaryCalculateModalProps {
  open: boolean;
  onClose: () => void;
}

export function SalaryCalculateModal({ open, onClose }: SalaryCalculateModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-3xl flex items-center justify-center mx-auto">
          <Calculator className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">급여 산출</h2>
          <p className="text-sm text-gray-400 mt-1">커밋 3.2 에서 활성화 예정 (위험 액션, 멱등 X)</p>
        </div>
        <Button onClick={onClose} className="w-full h-12 rounded-2xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200">
          닫기
        </Button>
      </div>
    </div>
  );
}
