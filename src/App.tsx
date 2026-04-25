/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Sidebar, TabType } from "./components/dashboard/Sidebar";
import { TopBar } from "./components/dashboard/TopBar";
import { PersonnelTable } from "./components/dashboard/PersonnelTable";
import { GuestTable } from "./components/dashboard/GuestTable";
import { IntegratedDashboard } from "./components/dashboard/IntegratedDashboard";
import { AccessRecordTable } from "./components/dashboard/AccessRecordTable";
import { ZoneManagement } from "./components/dashboard/ZoneManagement";
import { SalaryManagement } from "./components/dashboard/SalaryManagement";
import { BuildingManagement } from "./components/dashboard/BuildingManagement";
import { LoginPage } from "./components/auth/LoginPage";
import { Briefcase, CheckCircle2, Hourglass, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster } from "@/components/ui/sonner";

export interface Guest {
  id: string;
  name: string;
  company: string;
  host: string;
  details: string;
  status: "방문중" | "출입 전" | "방문완료";
  entryTime: string;
  exitTime: string;
  date: string;
}

const initialGuests: Guest[] = [
  { id: "1", name: "김호탈", company: "삼성전자", host: "강경석", details: "회의", status: "방문중", entryTime: "10:50", exitTime: "-", date: "26.12.25" },
  { id: "2", name: "강덕순", company: "LG", host: "임한석", details: "결재", status: "출입 전", entryTime: "13:30", exitTime: "-", date: "26.08.17" },
  { id: "3", name: "임호탈", company: "현대자동차", host: "이문영", details: "사장접견", status: "방문완료", entryTime: "10:00", exitTime: "12:30", date: "26.02.20" },
  // 27 more mock guests
  ...[
    "박지성", "손흥민", "김연아", "류현진", "이강인", "황희찬", "조규성", "백승호", "정우영", "김민재",
    "이지은", "박보검", "김수현", "송중기", "한소희", "전지현", "공유", "현빈", "손예진", "김태리",
    "남주혁", "배수지", "박서준", "정해인", "김선호", "신민아", "이정재"
  ].map((name, i) => ({
    id: (i + 4).toString(),
    name,
    company: ["네이버", "카카오", "쿠팡", "배달의민족", "토스", "당근마켓", "직방"][Math.floor(Math.random() * 7)],
    host: ["김철수", "이영희", "박민수", "최지우", "정다은"][Math.floor(Math.random() * 5)],
    details: ["업무 미팅", "면접", "장비 점검", "계약 체결", "단순 방문"][Math.floor(Math.random() * 5)],
    status: ["방문중", "출입 전", "방문완료"][Math.floor(Math.random() * 3)] as any,
    entryTime: `${Math.floor(9 + Math.random() * 8)}:00`,
    exitTime: Math.random() > 0.5 ? `${Math.floor(14 + Math.random() * 4)}:30` : "-",
    date: `26.04.${Math.floor(10 + Math.random() * 20)}`
  }))
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("통합 관제");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
        <Toaster theme="light" position="bottom-right" />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "통합 관제":
        return <IntegratedDashboard onTabChange={setActiveTab} />;
      case "건물 관리":
        return <BuildingManagement />;
      case "급여 관리":
        return <SalaryManagement />;
      case "구역 관리":
        return <ZoneManagement />;
      case "출입 기록 관리":
        return (
          <div className="space-y-8">
            <header>
              <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">출입 기록 관리</h1>
              <p className="text-gray-500 text-lg font-medium">건물 및 구역별 상세 출입 기록을 모니터링합니다</p>
            </header>
            <AccessRecordTable />
          </div>
        );
      case "인사 관리":
        return (
          <div className="space-y-8">
            <header>
              <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">인사 관리</h1>
              <p className="text-gray-500 text-lg font-medium">직원 명부 및 근태 현황을 관리합니다</p>
            </header>
            <PersonnelTable onTabChange={setActiveTab} onAddGuest={(newGuest) => setGuests(prev => [...prev, newGuest])} />
          </div>
        );
      case "게스트 관리":
        return (
          <div className="space-y-8">
            <header>
              <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">게스트 관리</h1>
              <p className="text-gray-500 text-lg font-medium">방문객 출입 및 현황을 관리합니다</p>
            </header>
            <GuestTable guests={guests} setGuests={setGuests} />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🚧</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{activeTab} 페이지 준비 중</h2>
            <p className="text-gray-500 max-w-md">
              현재 이 페이지는 개발 중입니다. 곧 멋진 기능으로 찾아뵙겠습니다!
            </p>
            <button 
              onClick={() => setActiveTab("통합 관제")}
              className="mt-4 px-6 py-2 bg-black text-white rounded-full font-bold hover:bg-black/90 transition-colors"
            >
              대시보드로 돌아가기
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-gray-900 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={() => setIsLoggedIn(false)}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Toaster theme="light" position="bottom-right" />
    </div>
  );
}

