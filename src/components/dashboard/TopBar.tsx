import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ROUTES } from "@/src/routes/paths";
import { User as UserType } from "../../types";

interface TopBarProps {
  user: UserType | null;
  onLogout: () => void;
}

// 우상단 사용자 드롭다운.
// 플랜 3-4 묶음 5 추가 정리 (2026-05-15): mock 알림(Bell) DropdownMenu + hasUnread state 일괄 제거.
// 백엔드 알림 도메인(NotificationController) 부재 — 묶음 5 mock 모달 3종 제거와 동일 카테고리.
// 향후 백엔드 알림 피드 API 도입 시 신규 컴포넌트로 재추가 (yagni).
export function TopBar({ user, onLogout }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="h-20 flex items-center justify-end px-8 bg-white border-b border-gray-100">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-10 h-10 border-2 border-gray-100 cursor-pointer hover:border-gray-200 transition-all outline-none rounded-full overflow-hidden flex items-center justify-center">
              <Avatar className="w-full h-full border-none">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "User"}`}
                />
                <AvatarFallback>
                  {user?.name.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white text-black border border-gray-100 shadow-2xl rounded-2xl p-2 z-50"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  나의 계정
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-gray-100 mx-2 my-1" />
              <DropdownMenuItem
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors cursor-pointer outline-none focus:bg-gray-50"
                onClick={() => navigate(`${ROUTES.PERSONNEL}?view=myinfo`)}
              >
                <User className="w-4 h-4" /> 내 정보
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100 mx-2 my-1" />
              <DropdownMenuItem
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer outline-none focus:bg-red-50"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4" /> 로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
