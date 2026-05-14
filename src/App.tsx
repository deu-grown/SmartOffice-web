/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useLogoutMutation } from "./features/auth/hooks";
import { Sidebar } from "./components/dashboard/Sidebar";
import { TopBar } from "./components/dashboard/TopBar";
import { PersonnelTable } from "./components/dashboard/PersonnelTable";
import { IntegratedDashboard } from "./components/dashboard/IntegratedDashboard";
import { AccessRecordTable } from "./components/dashboard/AccessRecordTable";
import { ZoneManagement } from "./components/dashboard/ZoneManagement";
import { SalaryManagement } from "./components/dashboard/SalaryManagement";
import { BuildingManagement } from "./components/dashboard/BuildingManagement";
import { ParkingManagement } from "./components/dashboard/ParkingManagement";
import { InventoryManagement } from "./components/dashboard/InventoryManagement";

import { useAuthStore } from "./stores/authStore";
import { useUIStore } from "./stores/uiStore";
import { PATH_TO_TAB, ROUTES, TAB_TO_PATH } from "./routes/paths";
import type { Room, TabType } from "./types";

// 본 작업(플랜 2) 시점의 mock 데이터. 플랜 3에서 도메인별 API 연동으로 대체될 예정.
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
    groups: ["IT본부", "보안팀"],
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
    groups: ["개발본부"],
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
    groups: ["경영지원"],
  },
  {
    id: "4",
    name: "회의실 A",
    type: "공용공간",
    gateActive: false,
    floor: "3F",
    permissions: [{ id: "rank-all", name: "전체 직급", type: "RANK", allowed: true }],
    groups: ["전체"],
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
    groups: ["연구개발"],
  },
  {
    id: "6",
    name: "안내 데스크",
    type: "일반구역",
    gateActive: false,
    floor: "1F",
    permissions: [{ id: "rank-all", name: "전체 직급", type: "RANK", allowed: true }],
    groups: ["운영지원"],
  },
  {
    id: "7",
    name: "물류 창고",
    type: "보안구역",
    gateActive: true,
    floor: "1F",
    permissions: [{ id: "dept-4", name: "물류팀", type: "DEPT", allowed: true }],
    groups: ["물류팀"],
  },
  {
    id: "8",
    name: "마케팅실",
    type: "사무공간",
    gateActive: true,
    floor: "2F",
    permissions: [{ id: "dept-5", name: "마케팅팀", type: "DEPT", allowed: true }],
    groups: ["마케팅팀"],
  },
  {
    id: "9",
    name: "인사팀",
    type: "사무공간",
    gateActive: true,
    floor: "2F",
    permissions: [{ id: "dept-6", name: "인사본부", type: "DEPT", allowed: true }],
    groups: ["인사본부"],
  },
  {
    id: "10",
    name: "디자인 랩",
    type: "보안구역",
    gateActive: true,
    floor: "4F",
    permissions: [{ id: "dept-7", name: "디자인팀", type: "DEPT", allowed: true }],
    groups: ["디자인팀"],
  },
];

// GuestTable 컴포넌트가 import 하는 타입. 본 작업 범위 내에서는 시그니처 그대로 유지한다.
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

// 게스트 페이지는 현재 사이드바에서 임시 숨김. Guest 인터페이스는 GuestTable.tsx 가 참조.

function ComingSoon({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-4xl">🚧</span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900">{title} 페이지 준비 중</h2>
      <p className="text-gray-500 max-w-md">
        현재 이 페이지는 개발 중입니다. 곧 멋진 기능으로 찾아뵙겠습니다!
      </p>
      <button
        onClick={onBack}
        className="mt-4 px-6 py-2 bg-black text-white rounded-full font-bold hover:bg-black/90 transition-colors"
      >
        대시보드로 돌아가기
      </button>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const logoutMutation = useLogoutMutation();

  // mock 상태 — 플랜 3 페이지 마이그레이션에서 도메인별 API 로 대체.
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [roomsSnapshot, setRoomsSnapshot] = useState<Room[]>(initialRooms);

  const [buildingLocks, setBuildingLocks] = useState({ temp: false, hum: false, light: false });
  const [buildingLocksSnapshot, setBuildingLocksSnapshot] = useState({
    temp: false,
    hum: false,
    light: false,
  });

  const [buildingSettings, setBuildingSettings] = useState({
    targetTemp: 24,
    targetHumidity: 45,
    isLightOn: true,
    brightness: 80,
  });
  const [buildingSettingsSnapshot, setBuildingSettingsSnapshot] = useState({
    targetTemp: 24,
    targetHumidity: 45,
    isLightOn: true,
    brightness: 80,
  });

  const [hasUnsavedZoneChanges, setHasUnsavedZoneChanges] = useState(false);
  const [hasUnsavedBuildingChanges, setHasUnsavedBuildingChanges] = useState(false);
  const [pendingTab, setPendingTab] = useState<TabType | null>(null);
  const [showNavGuard, setShowNavGuard] = useState(false);

  const activeTab: TabType = PATH_TO_TAB[location.pathname] ?? "통합 관제";

  const handleLogout = () => {
    // 서버 호출은 fire-and-forget. onSettled 에서 클라이언트 상태 정리 + 토스트 + 라우팅 처리.
    logoutMutation.mutate();
  };

  const navigateToTab = (tab: TabType) => {
    const path = TAB_TO_PATH[tab];
    if (path) navigate(path);
  };

  const handleTabChange = (tab: TabType) => {
    if (
      (activeTab === "구역 관리" && hasUnsavedZoneChanges) ||
      (activeTab === "건물 관리" && hasUnsavedBuildingChanges)
    ) {
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
      navigateToTab(tab);
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
    const nextTab = pendingTab;
    setShowNavGuard(false);
    setPendingTab(null);
    if (nextTab) navigateToTab(nextTab);
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
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                저장하지 않은
                <br />
                변경사항이 있습니다
              </h2>
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
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user} onLogout={handleLogout} />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              <Routes>
                <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                <Route
                  path="dashboard"
                  element={<IntegratedDashboard onTabChange={handleTabChange} />}
                />
                <Route
                  path="building"
                  element={
                    <BuildingManagement
                      locks={buildingLocks}
                      setLocks={setBuildingLocks}
                      settings={buildingSettings}
                      setSettings={setBuildingSettings}
                      setHasUnsavedChanges={setHasUnsavedBuildingChanges}
                    />
                  }
                />
                <Route path="salary" element={<SalaryManagement />} />
                <Route
                  path="zones"
                  element={
                    <ZoneManagement
                      rooms={rooms}
                      setRooms={setRooms}
                      setHasUnsavedChanges={setHasUnsavedZoneChanges}
                      onSave={() => setRoomsSnapshot(JSON.parse(JSON.stringify(rooms)))}
                    />
                  }
                />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="parking" element={<ParkingManagement />} />
                <Route
                  path="access-logs"
                  element={
                    <div className="space-y-8">
                      <header>
                        <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">
                          출입 기록 관리
                        </h1>
                        <p className="text-gray-500 text-lg font-medium">
                          건물 및 구역별 상세 출입 기록을 모니터링합니다
                        </p>
                      </header>
                      <AccessRecordTable />
                    </div>
                  }
                />
                <Route
                  path="personnel"
                  element={
                    <div className="space-y-8">
                      <header>
                        <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">
                          인사 관리
                        </h1>
                        <p className="text-gray-500 text-lg font-medium">
                          직원 명부 및 근태 현황을 관리합니다
                        </p>
                      </header>
                      <PersonnelTable onTabChange={handleTabChange} />
                    </div>
                  }
                />
                {/* 게스트 페이지는 백엔드 도메인 미구현으로 임시 숨김. URL 직접 진입 시 대시보드로 리다이렉트. */}
                <Route path="guest" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                <Route
                  path="settings"
                  element={
                    <ComingSoon title="시스템 설정" onBack={() => navigate(ROUTES.DASHBOARD)} />
                  }
                />
                <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
