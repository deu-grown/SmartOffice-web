/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Sidebar } from "./components/dashboard/Sidebar";
import { TopBar } from "./components/dashboard/TopBar";
import { PersonnelTable } from "./components/dashboard/PersonnelTable";
import { GuestTable } from "./components/dashboard/GuestTable";
import { IntegratedDashboard } from "./components/dashboard/IntegratedDashboard";
import { AccessRecordTable } from "./components/dashboard/AccessRecordTable";
import { ZoneManagement } from "./components/dashboard/ZoneManagement";
import { SalaryManagement } from "./components/dashboard/SalaryManagement";
import { BuildingManagement } from "./components/dashboard/BuildingManagement";
import { ParkingManagement } from "./components/dashboard/ParkingManagement";
import { InventoryManagement } from "./components/dashboard/InventoryManagement";
import { LoginPage } from "./components/auth/LoginPage";
import { Briefcase, CheckCircle2, Hourglass, Clock, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { User, Room, TabType } from "./types";
import { toast } from "sonner";

const initialRooms: Room[] = [
  { 
    id: "1", 
    name: "서버실", 
    type: "보안구역", 
    gateActive: true,
    floor: "3F",
    permissions: [
      { id: "rank-1", name: "부장", type: "RANK", allowed: true },
      { id: "rank-2", name: "과장", type: "RANK", allowed: true },
      { id: "staff-1", name: "김호탈", type: "STAFF", allowed: true },
      { id: "dept-1", name: "보안팀", type: "DEPT", allowed: true },
      { id: "dept-2", name: "IT개발부", type: "DEPT", allowed: false },
    ],
    groups: ["IT본부", "보안팀"]
  },
  { 
    id: "2", 
    name: "개발 1팀", 
    type: "사무공간", 
    gateActive: true,
    floor: "3F",
    permissions: [
      { id: "rank-all", name: "전체 직급", type: "RANK", allowed: true },
      { id: "dept-2", name: "IT개발부", type: "DEPT", allowed: true },
    ],
    groups: ["개발본부"]
  },
  { 
    id: "3", 
    name: "임원실", 
    type: "보안구역", 
    gateActive: true,
    floor: "3F",
    permissions: [
      { id: "rank-1", name: "부장", type: "RANK", allowed: true },
      { id: "staff-2", name: "이대표", type: "STAFF", allowed: true },
    ],
    groups: ["경영지원"]
  },
  { 
    id: "4", 
    name: "회의실 A", 
    type: "공용공간", 
    gateActive: false,
    floor: "3F",
    permissions: [
      { id: "rank-all", name: "전체 직급", type: "RANK", allowed: true },
    ],
    groups: ["전체"]
  },
  { 
    id: "5", 
    name: "R&D 센터", 
    type: "보안구역", 
    gateActive: true,
    floor: "5F",
    permissions: [
      { id: "rank-1", name: "부장", type: "RANK", allowed: true },
      { id: "dept-3", name: "연구소", type: "DEPT", allowed: true },
    ],
    groups: ["연구개발"]
  },
  { 
    id: "6", 
    name: "안내 데스크", 
    type: "일반구역", 
    gateActive: false,
    floor: "1F",
    permissions: [
      { id: "rank-all", name: "전체 직급", type: "RANK", allowed: true },
    ],
    groups: ["운영지원"]
  },
  { 
    id: "7", 
    name: "물류 창고", 
    type: "보안구역", 
    gateActive: true,
    floor: "1F",
    permissions: [
      { id: "dept-4", name: "물류팀", type: "DEPT", allowed: true },
    ],
    groups: ["물류팀"]
  },
  { 
    id: "8", 
    name: "마케팅실", 
    type: "사무공간", 
    gateActive: true,
    floor: "2F",
    permissions: [
      { id: "dept-5", name: "마케팅팀", type: "DEPT", allowed: true },
    ],
    groups: ["마케팅팀"]
  },
  { 
    id: "9", 
    name: "인사팀", 
    type: "사무공간", 
    gateActive: true,
    floor: "2F",
    permissions: [
      { id: "dept-6", name: "인사본부", type: "DEPT", allowed: true },
    ],
    groups: ["인사본부"]
  },
  { 
    id: "10", 
    name: "디자인 랩", 
    type: "보안구역", 
    gateActive: true,
    floor: "4F",
    permissions: [
      { id: "dept-7", name: "디자인팀", type: "DEPT", allowed: true },
    ],
    groups: ["디자인팀"]
  }
];

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("통합 관제");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [roomsSnapshot, setRoomsSnapshot] = useState<Room[]>(initialRooms);
  
  const [buildingLocks, setBuildingLocks] = useState({
    temp: false,
    hum: false,
    light: false
  });
  const [buildingLocksSnapshot, setBuildingLocksSnapshot] = useState({
    temp: false,
    hum: false,
    light: false
  });

  const [buildingSettings, setBuildingSettings] = useState({
    targetTemp: 24,
    targetHumidity: 45,
    isLightOn: true,
    brightness: 80
  });
  const [buildingSettingsSnapshot, setBuildingSettingsSnapshot] = useState({
    targetTemp: 24,
    targetHumidity: 45,
    isLightOn: true,
    brightness: 80
  });

  const [hasUnsavedZoneChanges, setHasUnsavedZoneChanges] = useState(false);
  const [hasUnsavedBuildingChanges, setHasUnsavedBuildingChanges] = useState(false);
  const [pendingTab, setPendingTab] = useState<TabType | null>(null);
  const [showNavGuard, setShowNavGuard] = useState(false);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    toast.success("로그아웃되었습니다.");
  };

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster theme="light" position="bottom-right" />
      </>
    );
  }

  const handleTabChange = (tab: TabType) => {
    if ((activeTab === "구역 관리" && hasUnsavedZoneChanges) || (activeTab === "건물 관리" && hasUnsavedBuildingChanges)) {
      setPendingTab(tab);
      setShowNavGuard(true);
    } else {
      if (tab === "구역 관리") {
        setRoomsSnapshot(JSON.parse(JSON.stringify(rooms)));
      }
      if (tab === "건물 관리") {
        setBuildingLocksSnapshot({ ...buildingLocks });
        setBuildingSettingsSnapshot({ ...buildingSettings });
      }
      setActiveTab(tab);
    }
  };

  const confirmNavigation = (save: boolean) => {
    if (save) {
      if (activeTab === "구역 관리") {
        setRoomsSnapshot(JSON.parse(JSON.stringify(rooms)));
      }
      if (activeTab === "건물 관리") {
        setBuildingLocksSnapshot({ ...buildingLocks });
        setBuildingSettingsSnapshot({ ...buildingSettings });
      }
      toast.success("변경사항이 저장되었습니다.");
    } else {
      if (activeTab === "구역 관리") {
        setRooms(JSON.parse(JSON.stringify(roomsSnapshot)));
      }
      if (activeTab === "건물 관리") {
        setBuildingLocks({ ...buildingLocksSnapshot });
        setBuildingSettings({ ...buildingSettingsSnapshot });
      }
      toast.info("변경사항이 무시되었습니다.");
    }
    setHasUnsavedZoneChanges(false);
    setHasUnsavedBuildingChanges(false);
    if (pendingTab) setActiveTab(pendingTab);
    setShowNavGuard(false);
    setPendingTab(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "통합 관제":
        return <IntegratedDashboard onTabChange={handleTabChange} />;
      case "건물 관리":
        return (
          <BuildingManagement 
            locks={buildingLocks} 
            setLocks={setBuildingLocks} 
            settings={buildingSettings}
            setSettings={setBuildingSettings}
            setHasUnsavedChanges={setHasUnsavedBuildingChanges} 
          />
        );
      case "급여 관리":
        return <SalaryManagement />;
      case "구역 관리":
        return (
          <ZoneManagement 
            rooms={rooms} 
            setRooms={setRooms} 
            setHasUnsavedChanges={setHasUnsavedZoneChanges} 
            onSave={() => setRoomsSnapshot(JSON.parse(JSON.stringify(rooms)))}
          />
        );
      case "재고 관리":
        return <InventoryManagement />;
      case "주차 관리":
        return <ParkingManagement />;
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
            <PersonnelTable onTabChange={handleTabChange} onAddGuest={(newGuest) => setGuests(prev => [...prev, newGuest])} />
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
              onClick={() => handleTabChange("통합 관제")}
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
      {showNavGuard && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl space-y-8 text-center"
          >
            <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">저장하지 않은<br />변경사항이 있습니다</h2>
              <p className="text-gray-500 font-medium">이동하시기 전에 변경사항을 저장할까요?</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => confirmNavigation(true)}
                className="w-full h-14 rounded-2xl font-bold bg-black text-white hover:bg-black/90"
              >
                저장하고 이동하기
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => confirmNavigation(false)}
                className="w-full h-14 rounded-2xl font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                무시하고 이동하기
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowNavGuard(false)}
                className="w-full h-14 rounded-2xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              >
                페이지에 머물기
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={() => setIsLoggedIn(false)}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={currentUser} onLogout={handleLogout} />
        
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

