import { useState } from "react";
import { Search, Printer, FileDown, MoreHorizontal, ChevronRight, Briefcase, Calendar, DollarSign, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SalaryRecord {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  leaveCount: number;
  overtimeHours: number;
  overtimeAmount: number;
  totalWorkHours: number;
  weeklyAllowance: number;
  netPayment: number;
  deduction: number;
  baseSalary: number;
  foodAllowance: number;
}

const initialEmployees: SalaryRecord[] = [
  { id: "1", name: "김호탈", employeeId: "37821", department: "기획부", leaveCount: 2, overtimeHours: 23, overtimeAmount: 230000, totalWorkHours: 250, weeklyAllowance: 185000, netPayment: 3500000, deduction: 450000, baseSalary: 3100000, foodAllowance: 100000 },
  { id: "2", name: "강덕순", employeeId: "86562", department: "개발부", leaveCount: 1, overtimeHours: 32, overtimeAmount: 320000, totalWorkHours: 280, weeklyAllowance: 225000, netPayment: 3600000, deduction: 378000, baseSalary: 3200000, foodAllowance: 100000 },
  { id: "3", name: "임호탈", employeeId: "16561", department: "인사부", leaveCount: 0, overtimeHours: 45, overtimeAmount: 450000, totalWorkHours: 320, weeklyAllowance: 235000, netPayment: 3700000, deduction: 479000, baseSalary: 3300000, foodAllowance: 100000 },
  { id: "4", name: "강경석", employeeId: "89981", department: "영업부", leaveCount: 3, overtimeHours: 33, overtimeAmount: 330000, totalWorkHours: 340, weeklyAllowance: 227000, netPayment: 3750000, deduction: 213000, baseSalary: 3350000, foodAllowance: 100000 },
  { id: "5", name: "곽춘호", employeeId: "48484", department: "마케팅부", leaveCount: 1, overtimeHours: 22, overtimeAmount: 220000, totalWorkHours: 345, weeklyAllowance: 315000, netPayment: 4000000, deduction: 454000, baseSalary: 3600000, foodAllowance: 100000 },
  { id: "6", name: "운종랑", employeeId: "84655", department: "기획부", leaveCount: 2, overtimeHours: 51, overtimeAmount: 510000, totalWorkHours: 350, weeklyAllowance: 350000, netPayment: 4200000, deduction: 512000, baseSalary: 3800000, foodAllowance: 100000 },
];

export function SalaryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<SalaryRecord | null>(initialEmployees[0]);

  const filteredEmployees = initialEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.employeeId.includes(searchTerm)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const handlePrint = () => {
    toast.success("급여 명세서가 인쇄 대기열에 추가되었습니다.");
  };

  const handleDownloadPdf = () => {
    toast.success("명세서 PDF 다운로드가 시작되었습니다.");
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">직원별 급여 관리</h1>
        <p className="text-gray-500 text-lg font-medium">출퇴근 시간 조회 및 수당을 포함한 상세 급여를 계산합니다</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="이름 또는 사번으로 검색..."
                className="pl-12 bg-transparent border-none focus-visible:ring-0 text-lg h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="h-8 w-[1px] bg-gray-100 mx-2" />
            <div className="flex items-center gap-2 px-2">
              <span className="text-sm font-medium text-gray-500">2026.03</span>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden p-4">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pb-4">이름</TableHead>
                  <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pb-4">사번</TableHead>
                  <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pb-4">휴가</TableHead>
                  <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pb-4">초과근무/금액</TableHead>
                  <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pb-4">근무시간</TableHead>
                  <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pb-4">주휴수당</TableHead>
                  <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pb-4">실지급액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredEmployees.map((record) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedEmployee(record)}
                      className={cn(
                        "group cursor-pointer border-none transition-all duration-200",
                        selectedEmployee?.id === record.id ? "bg-black/5" : "hover:bg-gray-50"
                      )}
                    >
                      <TableCell className="py-5 font-bold">
                        {record.name}
                      </TableCell>
                      <TableCell className="py-5 text-gray-500 font-medium font-mono text-sm">{record.employeeId}</TableCell>
                      <TableCell className="py-5">
                        <Badge variant="outline" className="rounded-full font-bold px-3 py-1 border-gray-100 text-gray-600 bg-gray-50 uppercase text-[10px]">
                          {record.leaveCount}d
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-gray-900">{record.overtimeHours}h</span>
                          <span className="text-[10px] text-gray-400 font-mono">₩{formatCurrency(record.overtimeAmount)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 font-bold text-gray-700">{record.totalWorkHours}h</TableCell>
                      <TableCell className="py-5 font-mono text-sm text-gray-500">₩{formatCurrency(record.weeklyAllowance)}</TableCell>
                      <TableCell className="py-5">
                        <span className="font-bold text-black font-mono">₩{formatCurrency(record.netPayment)}</span>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="w-full lg:w-96 shrink-0">
          <AnimatePresence mode="wait">
            {selectedEmployee ? (
              <motion.div
                key={selectedEmployee.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-[#EEF1FF] rounded-[40px] p-8 h-full min-h-[700px] flex flex-col"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-900">2026년 3월 급여 명세서</h3>
                </div>

                <div className="flex gap-2 mb-10">
                  <Button onClick={handlePrint} variant="outline" className="flex-1 bg-black text-white hover:bg-black/90 rounded-2xl border-none font-bold h-10 gap-2">
                    <Printer className="w-4 h-4" />
                    명세서 인쇄
                  </Button>
                  <Button onClick={handleDownloadPdf} variant="outline" className="flex-1 bg-[#8E8FFA] text-white hover:bg-[#7a7be6] rounded-2xl border-none font-bold h-10 gap-2">
                    <FileDown className="w-4 h-4" />
                    pdf 저장
                  </Button>
                </div>

                <div className="space-y-8 flex-1">
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <span className="text-gray-500 font-medium">성함</span>
                    <span className="text-right font-bold">{selectedEmployee.name}</span>
                    <span className="text-gray-500 font-medium">부서</span>
                    <span className="text-right font-bold">{selectedEmployee.department}</span>
                  </div>

                  <div className="h-[1px] bg-gray-200/50" />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm font-medium">기본급</span>
                      <span className="font-mono font-bold text-lg">₩{formatCurrency(selectedEmployee.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm font-medium">초과수당</span>
                      <span className="font-mono font-bold text-lg">₩{formatCurrency(selectedEmployee.overtimeAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm font-medium">식대</span>
                      <span className="font-mono font-bold text-lg">₩{formatCurrency(selectedEmployee.foodAllowance)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm font-medium">소득공제</span>
                      <span className="font-mono font-bold text-lg text-red-500">-₩{formatCurrency(selectedEmployee.deduction)}</span>
                    </div>
                  </div>

                  <div className="h-[1px] bg-gray-200/50" />

                  <div className="bg-white/50 p-6 rounded-3xl space-y-2 mt-auto">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">실 수령액</span>
                    <div className="flex justify-between items-end">
                      <span className="text-3xl font-black font-mono">₩{formatCurrency(selectedEmployee.netPayment)}</span>
                      <span className="text-[10px] text-gray-400 font-medium mb-1">KRW</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 pt-4">
                    <div className="p-1 px-2 border border-gray-200 rounded text-[10px] text-gray-400 bg-white/30 uppercase font-black tracking-tighter">info</div>
                    <p className="text-[10px] text-gray-400 leading-tight">
                      소득세, 국민연금, 보험료 등이 차감된 최종 지급액입니다. 상세 내역은 HR 부서에 문의해 주세요.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center h-full min-h-[700px]">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <DollarSign className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">직원을 선택해 주세요</h3>
                <p className="text-gray-400 text-sm max-w-[200px]">
                  직원을 선택하면 상세한 급여 명세서를 조회의 가능합니다.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
