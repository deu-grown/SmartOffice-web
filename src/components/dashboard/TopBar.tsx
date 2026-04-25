import React, { useState } from "react";
import { Search, Bell, Plus, Command, User, Settings, LogOut, Shield, Mail, Phone, MapPin, Key, Globe, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function TopBar() {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Profile data
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex.j@smartoffice.com",
    phone: "010-1234-5678",
    department: "시스템 관리팀",
    role: "Admin"
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactor: true,
    autoLock: true,
    accessLogs: true
  });

  // System settings
  const [system, setSystem] = useState({
    language: "ko",
    notifications: true,
    darkMode: false
  });

  const handleNotificationClick = () => {
    if (hasUnreadNotifications) {
      toast.success("모든 알림을 읽음 처리했습니다.");
      setHasUnreadNotifications(false);
    } else {
      toast.info("새로운 알림이 없습니다.");
    }
  };

  const handleSaveProfile = () => {
    toast.success("프로필 정보가 저장되었습니다.");
    setShowProfileModal(false);
  };

  const handleSaveSettings = () => {
    toast.success("시스템 설정이 반영되었습니다.");
    setShowSettingsModal(false);
  };

  return (
    <header className="h-20 flex items-center justify-end px-8 bg-white border-b border-gray-100">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-black hover:bg-gray-50 rounded-full relative outline-none"
              >
                <Bell className="w-5 h-5" />
                {hasUnreadNotifications && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white text-black border border-gray-100 shadow-2xl rounded-2xl p-2 z-50">
              <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">최근 알람</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100 mx-2 my-1" />
              <div className="max-h-[300px] overflow-y-auto">
                <DropdownMenuItem 
                  className="flex flex-col items-start gap-1 px-3 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer outline-none"
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
                  className="flex flex-col items-start gap-1 px-3 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer outline-none"
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
                  className="flex flex-col items-start gap-1 px-3 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer outline-none"
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
            <DropdownMenuTrigger>
              <Avatar className="w-10 h-10 border-2 border-gray-100 cursor-pointer hover:border-gray-200 transition-all outline-none">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                <AvatarFallback>AX</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white text-black border border-gray-100 shadow-2xl rounded-2xl p-2 z-50">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">나의 계정</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-gray-100 mx-2 my-1" />
              <DropdownMenuItem 
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors cursor-pointer outline-none"
                onClick={() => setShowProfileModal(true)}
              >
                <User className="w-4 h-4" /> 프로필 설정
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors cursor-pointer outline-none"
                onClick={() => setShowSettingsModal(true)}
              >
                <Settings className="w-4 h-4" /> 시스템 설정
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100 mx-2 my-1" />
              <DropdownMenuItem 
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer outline-none"
                onClick={() => {
                  toast.success("로그아웃 되었습니다.");
                  window.location.reload(); // Simple way to logout in this demo
                }}
              >
                <LogOut className="w-4 h-4" /> 로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Settings Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-[450px] bg-white rounded-[32px] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">프로필 설정</DialogTitle>
            <DialogDescription className="text-gray-500">계정 정보를 확인하고 수정할 수 있습니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-4 mb-4">
              <Avatar className="w-24 h-24 border-4 border-gray-50 shadow-sm">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                <AvatarFallback>AX</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="rounded-full h-8 text-xs">사진 변경</Button>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs font-bold text-gray-400 uppercase">이름</Label>
              <Input 
                value={profile.name} 
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="col-span-3 bg-gray-50 border-none rounded-xl h-10 px-4 focus:ring-2 focus:ring-black/5" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs font-bold text-gray-400 uppercase">이메일</Label>
              <Input 
                value={profile.email} 
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="col-span-3 bg-gray-50 border-none rounded-xl h-10 px-4 focus:ring-2 focus:ring-black/5" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs font-bold text-gray-400 uppercase">연락처</Label>
              <Input 
                value={profile.phone} 
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                className="col-span-3 bg-gray-50 border-none rounded-xl h-10 px-4 focus:ring-2 focus:ring-black/5" 
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowProfileModal(false)} className="rounded-xl font-bold">취소</Button>
            <Button onClick={handleSaveProfile} className="bg-black text-white hover:bg-black/90 rounded-xl font-bold px-6">저장하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* System Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-[450px] bg-white rounded-[32px] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">시스템 설정</DialogTitle>
            <DialogDescription className="text-gray-500">대시보드 환경을 개인화합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">기본 언어</Label>
              <div className="grid grid-cols-3 gap-2">
                {["한국어", "ENG", "日本語"].map(lang => (
                  <Button 
                    key={lang}
                    variant={system.language === (lang === "한국어" ? "ko" : lang === "ENG" ? "en" : "jp") ? "default" : "outline"}
                    className={cn(
                      "rounded-xl h-10 font-bold text-xs",
                      system.language === (lang === "한국어" ? "ko" : lang === "ENG" ? "en" : "jp") ? "bg-black text-white" : "border-gray-100"
                    )}
                    onClick={() => setSystem({...system, language: lang === "한국어" ? "ko" : lang === "ENG" ? "en" : "jp"})}
                  >
                    {lang}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
               <div className="flex items-center gap-3">
                 <Bell className="w-5 h-5 text-gray-400" />
                 <div className="space-y-0.5">
                   <Label className="text-sm font-bold">푸시 알림</Label>
                   <p className="text-[10px] text-gray-400">중요 보안 이벤트 알림을 받습니다.</p>
                 </div>
               </div>
               <Switch checked={system.notifications} onCheckedChange={(val) => setSystem({...system, notifications: val})} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
               <div className="flex items-center gap-3">
                 <Globe className="w-5 h-5 text-gray-400" />
                 <div className="space-y-0.5">
                   <Label className="text-sm font-bold">글로벌 타임존</Label>
                   <p className="text-[10px] text-gray-400">데이터를 UTC 기준으로 표시합니다.</p>
                 </div>
               </div>
               <Switch checked={false} disabled />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveSettings} className="w-full bg-black text-white hover:bg-black/90 rounded-xl h-12 font-bold">변경사항 저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
