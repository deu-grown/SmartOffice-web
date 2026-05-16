import { LayoutDashboard, FolderKanban, Calendar, Sparkles, Timer, BarChart3, CalendarClock, KeyRound, LogOut, ChevronLeft, ChevronRight, UserCheck, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "motion/react";
import { TabType } from "../../types";
import { ROUTES } from "@/src/routes/paths";

const menuItems = [
  { icon: LayoutDashboard, label: "통합 관제" },
  { icon: FolderKanban, label: "건물 관리" },
  { icon: Calendar, label: "구역 관리" },
  { icon: Sparkles, label: "출입 기록 관리" },
  { icon: UserCheck, label: "게스트 관리" },
  { icon: Timer, label: "재고 관리" },
  { icon: BarChart3, label: "인사 관리" },
  { icon: LayoutDashboard, label: "급여 관리" },
  { icon: Sparkles, label: "주차 관리" },
  { icon: CalendarClock, label: "회의실 관리" },
  { icon: KeyRound, label: "NFC 카드 관리" },
];

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export function Sidebar({ activeTab, onTabChange, isCollapsed, onToggle, onLogout }: SidebarProps) {
  const handleLogout = () => {
    toast.success("로그아웃 되었습니다.");
    onLogout();
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      className="bg-white text-gray-500 flex flex-col h-screen border-r border-gray-100 relative z-50"
    >
      <div className={cn("flex items-center gap-3 mb-12 px-6 pt-8", isCollapsed && "justify-center px-0")}>
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
          <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
        </div>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-black font-bold text-xl tracking-tight"
          >
            스마트 오피스
          </motion.span>
        )}
      </div>

      <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar px-4">
        <div>
          {!isCollapsed && (
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 px-2">메뉴</p>
          )}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onTabChange(item.label as TabType)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left",
                  activeTab === item.label 
                    ? "bg-gray-100 text-black" 
                    : "hover:bg-gray-50 hover:text-black",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", activeTab === item.label ? "text-black" : "text-gray-400 group-hover:text-black")} />
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 space-y-1">
        {import.meta.env.DEV && (
          <Link
            to={ROUTES.HARDWARE_TEST}
            title={isCollapsed ? "🧪 데이터 주입 (dev)" : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group hover:bg-amber-50 hover:text-amber-700 text-amber-500 text-sm",
              isCollapsed && "justify-center px-0"
            )}
          >
            <FlaskConical className="w-4 h-4 shrink-0" />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium truncate"
              >
                🧪 데이터 주입 (dev)
              </motion.span>
            )}
          </Link>
        )}
        <button
          onClick={handleLogout}
          title={isCollapsed ? "로그아웃" : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group hover:bg-gray-50 hover:text-black",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-black" />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-medium"
            >
              로그아웃
            </motion.span>
          )}
        </button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-all z-50 group"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
        )}
      </button>
    </motion.aside>
  );
}
