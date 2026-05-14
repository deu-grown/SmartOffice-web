// 직원별 급여 관리 페이지 컨테이너.
// 묶음 3 커밋 3.1 β 분할: record/setting 2-탭 + calculate 모달 슬롯. mock 유지 (커밋 3.2 에서 features/salary 흡수).
import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { SalaryRecordsTable } from "../salary/SalaryRecordsTable";
import { SalarySettingsTable } from "../salary/SalarySettingsTable";
import { SalaryCalculateModal } from "../salary/SalaryCalculateModal";

type SalaryTabId = "records" | "settings";

const TABS: { id: SalaryTabId; label: string }[] = [
  { id: "records", label: "급여 내역" },
  { id: "settings", label: "급여 기준" },
];

export function SalaryManagement() {
  const [activeTab, setActiveTab] = useState<SalaryTabId>("records");
  const [calcOpen, setCalcOpen] = useState(false);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">직원별 급여 관리</h1>
          <p className="text-gray-500 text-lg font-medium">출퇴근 시간 조회 및 수당을 포함한 상세 급여를 계산합니다</p>
        </div>
        <Button
          onClick={() => setCalcOpen(true)}
          className="bg-black text-white hover:bg-black/90 rounded-xl h-12 px-6 font-bold flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          급여 산출
        </Button>
      </header>

      <div className="flex bg-gray-50 p-1 rounded-2xl gap-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === t.id ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "records" && <SalaryRecordsTable />}
      {activeTab === "settings" && <SalarySettingsTable />}

      <SalaryCalculateModal open={calcOpen} onClose={() => setCalcOpen(false)} />
    </div>
  );
}
