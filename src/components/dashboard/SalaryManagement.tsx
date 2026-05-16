// 직원별 급여 관리 페이지 컨테이너 — features/salary 흡수 (묶음 3 커밋 3.2).
// year/month 셀렉터 + record/setting 2-탭 + calculate 위험 액션 모달.
import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { SalaryRecordsTable } from "../salary/SalaryRecordsTable";
import { SalarySettingsTable } from "../salary/SalarySettingsTable";
import { SalaryCalculateModal } from "../salary/SalaryCalculateModal";

type SalaryTabId = "records" | "settings";

const TABS: { id: SalaryTabId; label: string }[] = [
  { id: "records", label: "급여 내역" },
  { id: "settings", label: "급여 기준" },
];

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH = now.getMonth() + 1;

export function SalaryManagement() {
  const [activeTab, setActiveTab] = useState<SalaryTabId>("records");
  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const [month, setMonth] = useState<number>(CURRENT_MONTH);
  const [calcOpen, setCalcOpen] = useState(false);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold tracking-tight mb-2 text-foreground">직원별 급여 관리</h1>
          <p className="text-muted-foreground text-lg font-medium">출퇴근 집계 기반 급여 산출 · 직급별 기준 관리</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[100px] bg-surface border-border rounded-xl h-12 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[80px] bg-surface border-border rounded-xl h-12 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m}월
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setCalcOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 px-6 font-bold flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            급여 산출
          </Button>
        </div>
      </header>

      <div className="flex bg-surface-2 p-1 rounded-2xl gap-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === t.id ? "bg-surface text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "records" && <SalaryRecordsTable year={year} month={month} />}
      {activeTab === "settings" && <SalarySettingsTable />}

      <SalaryCalculateModal open={calcOpen} onClose={() => setCalcOpen(false)} defaultYear={year} defaultMonth={month} />
    </div>
  );
}
