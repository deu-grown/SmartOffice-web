import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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

// 우상단 알림 + 사용자 드롭다운.
// 플랜 3-4 묶음 5 (2026-05-15): mock 모달 3종(마이페이지/프로필 설정/시스템 설정) 제거.
// 본인 정보 조회·수정은 인사 관리 페이지의 "내 정보" 탭(MyProfileSection) 으로 일원화.
export function TopBar({ user, onLogout }: TopBarProps) {
  const navigate = useNavigate();
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  const handleNotificationClick = () => {
    if (hasUnreadNotifications) {
      toast.success("모든 알림을 읽음 처리했습니다.");
      setHasUnreadNotifications(false);
    } else {
      toast.info("새로운 알림이 없습니다.");
    }
  };

  return (
    <header className="h-20 flex items-center justify-end px-8 bg-white border-b border-gray-100">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="text-gray-400 hover:text-black hover:bg-gray-50 rounded-full relative outline-none w-10 h-10 flex items-center justify-center transition-colors">
              <Bell className="w-5 h-5" />
              {hasUnreadNotifications && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-white text-black border border-gray-100 shadow-2xl rounded-2xl p-2 z-50"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  최근 알람
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-gray-100 mx-2 my-1" />
              <div className="max-h-[300px] overflow-y-auto">
                <DropdownMenuItem
                  className="flex flex-col items-start gap-1 px-3 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer outline-none focus:bg-gray-50"
                  onClick={() => setHasUnreadNotifications(false)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="font-bold">보안 구역 침입 감지</span>
                    <span className="text-[10px] text-gray-400 ml-auto">방금 전</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    제 2 연구소 구역에서 미등록 인원의 출입 시도가 감지되었습니다.
                  </p>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex flex-col items-start gap-1 px-3 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer outline-none focus:bg-gray-50"
                  onClick={() => {}}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-2 h-2 bg-gray-200 rounded-full" />
                    <span className="font-bold">신규 게스트 도착</span>
                    <span className="text-[10px] text-gray-400 ml-auto">15분 전</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    삼성전자 김호탈 님이 정문 게이트에 도착했습니다.
                  </p>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex flex-col items-start gap-1 px-3 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer outline-none focus:bg-gray-50"
                  onClick={() => {}}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-2 h-2 bg-gray-200 rounded-full" />
                    <span className="font-bold">시스템 업데이트 완료</span>
                    <span className="text-[10px] text-gray-400 ml-auto">1시간 전</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    출입 통제 시스템 V2.4 업데이트가 성공적으로 완료되었습니다.
                  </p>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-gray-100 mx-2 my-1" />
              <Button
                variant="ghost"
                className="w-full text-xs text-gray-400 hover:text-black hover:bg-transparent h-8"
                onClick={handleNotificationClick}
              >
                모든 알림 보기
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>

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
