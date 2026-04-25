import React, { useState } from "react";
import { 
  Search, 
  Download, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  AlertCircle,
  Moon,
  Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { DatePicker } from "@/components/ui/DatePicker";

interface AccessRecord {
  id: string;
  timestamp: string;
  name: string;
  employeeId: string;
  gate: string;
  method: string;
  status: "정상 승인" | "인가 실패" | "야간 출입";
}

const initialRecords: AccessRecord[] = [
  { id: "1", timestamp: "2026-03-24 11:20:15", name: "박성종", employeeId: "20201129", gate: "1층 메인 로비", method: "NFC 태그", status: "정상 승인" },
  { id: "2", timestamp: "2026-03-24 11:15:42", name: "김철수", employeeId: "20220314", gate: "3층 개발본부", method: "Face ID", status: "정상 승인" },
  { id: "3", timestamp: "2026-03-24 10:58:05", name: "이영희", employeeId: "20210502", gate: "지하 주차장 엘리베이터", method: "QR 코드", status: "정상 승인" },
  { id: "4", timestamp: "2026-03-24 10:42:30", name: "알렉산더", employeeId: "20251101", gate: "5층 임원실", method: "NFC 태그", status: "인가 실패" },
  { id: "5", timestamp: "2026-03-24 10:30:12", name: "최민수", employeeId: "20190822", gate: "1층 메인 로비", method: "NFC 태그", status: "정상 승인" },
  { id: "6", timestamp: "2026-03-24 09:15:55", name: "박지민", employeeId: "20230115", gate: "4층 회의실 A", method: "QR 코드", status: "정상 승인" },
  { id: "7", timestamp: "2026-03-24 08:50:20", name: "정우성", employeeId: "20181205", gate: "1층 메인 로비", method: "Face ID", status: "정상 승인" },
  { id: "8", timestamp: "2026-03-24 08:45:10", name: "한소희", employeeId: "20240930", gate: "지하 주차장 엘리베이터", method: "NFC 태그", status: "정상 승인" },
  { id: "9", timestamp: "2026-03-23 23:10:05", name: "강호동", employeeId: "20170412", gate: "3층 서버실", method: "마스터키", status: "야간 출입" },
  { id: "10", timestamp: "2026-03-24 22:05:40", name: "유재석", employeeId: "20200220", gate: "1층 메인 로비", method: "NFC 태그", status: "정상 승인" },
  ...Array.from({ length: 150 }, (_, i) => {
    const day = 23 + Math.floor(i / 40);
    const hour = Math.floor(Math.random() * 24);
    const min = Math.floor(Math.random() * 60);
    const sec = Math.floor(Math.random() * 60);
    const timestamp = `2026-03-${day} ${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    
    // Logical status based on hour
    let status: "정상 승인" | "인가 실패" | "야간 출입" = "정상 승인";
    if (hour >= 22 || hour <= 6) {
      status = "야간 출입";
    } else if (Math.random() > 0.95) {
      status = "인가 실패";
    }

    return {
      id: (i + 11).toString(),
      timestamp,
      name: `사용자 ${i + 11}`,
      employeeId: `202${Math.floor(10000 + Math.random() * 90000)}`,
      gate: ["1층 메인 로비", "3층 개발본부", "지하 주차장", "5층 임원실", "2층 식당"][Math.floor(Math.random() * 5)],
      method: ["NFC 태그", "Face ID", "QR 코드", "마스터키"][Math.floor(Math.random() * 4)],
      status,
    };
  })
];

export function AccessRecordTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("2026-03-23");
  const [endDate, setEndDate] = useState("2026-03-26");
  const [selectedGate, setSelectedGate] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const matchesDate = (timestamp: string) => {
    const recordDate = timestamp.split(" ")[0];
    return recordDate >= startDate && recordDate <= endDate;
  };

  const recordsInDateRange = initialRecords.filter(r => matchesDate(r.timestamp));

  const filteredRecords = recordsInDateRange.filter(record => {
    // Search filter
    const matchesSearch = record.name.includes(searchTerm) || record.employeeId.includes(searchTerm);
    
    // Gate filter
    const matchesGate = selectedGate === "전체" || record.gate.includes(selectedGate);
    
    // Status filter
    const matchesStatus = selectedStatus === "전체" || record.status === selectedStatus;

    return matchesSearch && matchesGate && matchesStatus;
  });

  const stats = {
    total: recordsInDateRange.length,
    abnormal: recordsInDateRange.filter(r => r.status === "인가 실패").length,
    night: recordsInDateRange.filter(r => r.status === "야간 출입").length,
    // Just a mock calculation for remaining people based on data density
    remaining: Math.floor(recordsInDateRange.filter(r => r.status === "정상 승인").length * 0.4)
  };

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const currentRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RecordStatCard 
          icon={Users} 
          label="오늘 총 출입자 수" 
          value={stats.total.toString()} 
          unit="명" 
          onClick={() => {
            setSelectedStatus("전체");
            setSelectedGate("전체");
            setSearchTerm("");
            setCurrentPage(1);
          }}
        />
        <RecordStatCard 
          icon={AlertCircle} 
          label="비정상 접근 시도" 
          value={stats.abnormal.toString()} 
          unit="건" 
          color="text-red-500" 
          onClick={() => {
            setSelectedStatus("인가 실패");
            setCurrentPage(1);
          }}
        />
        <RecordStatCard 
          icon={Moon} 
          label="야간/휴일 출입 건수" 
          value={stats.night.toString()} 
          unit="건" 
          color="text-indigo-500" 
          onClick={() => {
            setSelectedStatus("야간 출입");
            setCurrentPage(1);
          }}
        />
        <RecordStatCard 
          icon={Users} 
          label="현재 사내 잔류 인원" 
          value={stats.remaining.toString()} 
          unit="명" 
          color="text-green-500" 
          onClick={() => {
            setSelectedStatus("전체");
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DatePicker 
            label="시작일"
            date={startDate} 
            onChange={(val) => { setStartDate(val); setCurrentPage(1); }}
          />
          <DatePicker 
            label="종료일"
            date={endDate} 
            onChange={(val) => { setEndDate(val); setCurrentPage(1); }}
          />
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 ml-1">출입 게이트</label>
            <Select value={selectedGate} onValueChange={(val) => { setSelectedGate(val); setCurrentPage(1); }}>
              <SelectTrigger className="bg-gray-50 border-gray-100 rounded-xl h-12">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100">
                <SelectItem value="전체">전체</SelectItem>
                <SelectItem value="1층 메인 로비">1층 메인 로비</SelectItem>
                <SelectItem value="3층 개발본부">3층 개발본부</SelectItem>
                <SelectItem value="주차장">지하 주차장</SelectItem>
                <SelectItem value="5층 임원실">5층 임원실</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 ml-1">상태</label>
            <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setCurrentPage(1); }}>
              <SelectTrigger className="bg-gray-50 border-gray-100 rounded-xl h-12">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100">
                <SelectItem value="전체">전체</SelectItem>
                <SelectItem value="정상 승인">정상 승인</SelectItem>
                <SelectItem value="인가 실패">인가 실패</SelectItem>
                <SelectItem value="야간 출입">야간 출입</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="이름 또는 사번 입력" 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-gray-50 border-gray-100 rounded-xl h-12 pl-11"
            />
          </div>
          <div className="flex gap-2">
            <Button className="bg-black text-white hover:bg-black/90 rounded-xl h-12 px-8 font-bold flex items-center gap-2">
              <Search className="w-4 h-4" />
              검색
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">일시</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">사원명(사번)</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">출입 게이트</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{record.timestamp}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{record.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium">({record.employeeId})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">{record.gate}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "text-xs font-bold px-3 py-1 rounded-full",
                      record.status === "정상 승인" ? "bg-green-50 text-green-600" : 
                      record.status === "인가 실패" ? "bg-red-50 text-red-600" : 
                      "bg-indigo-50 text-indigo-600"
                    )}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-8 py-6 border-t border-gray-50">
          <p className="text-sm text-gray-500">
            전체 <span className="font-bold text-black">{filteredRecords.length}</span>건 중 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredRecords.length)} 표시
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl border-gray-100 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                // Only show a range of buttons if there are too many pages
                if (totalPages > 10) {
                  const isFirstSet = pageNum <= 3;
                  const isLastSet = pageNum > totalPages - 3;
                  const isMiddle = Math.abs(pageNum - currentPage) <= 1;
                  
                  if (!isFirstSet && !isLastSet && !isMiddle) {
                    if (pageNum === 4 || pageNum === totalPages - 3) return <span key={pageNum} className="text-gray-300 px-1">...</span>;
                    return null;
                  }
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "w-10 h-10 rounded-xl font-bold transition-all",
                      currentPage === pageNum ? "bg-black text-white shadow-lg" : "text-gray-400 hover:text-black hover:bg-gray-100"
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl border-gray-100 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordStatCard({ icon: Icon, label, value, unit, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4 text-left w-full hover:border-black/10 hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer"
    >
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
        <Icon className={cn("w-6 h-6", color || "text-black")} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          <span className="text-sm font-medium text-gray-400">{unit}</span>
        </div>
      </div>
    </button>
  );
}
