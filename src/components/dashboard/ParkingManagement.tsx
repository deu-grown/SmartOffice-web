import React, { useState, useMemo } from "react";
import { Search, Plus, MoreHorizontal, Car, Clock, Info, ChevronDown, Settings, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { ParkingZoneMap } from "@/src/components/parking/ParkingZoneMap";

// 묶음 3 (분할) — 평면도 시각화 영역은 ParkingZoneMap 으로 이관. mock vehicles / Dialog / 차량 stats / spot mock 은
// 컨테이너에 보존 (묶음 4 흡수 시점에 features/parking 으로 일괄 마이그레이션).

interface Vehicle {
  id: string;
  plateNumber: string;
  ownerName: string;
  status: "주차중" | "예약" | "출차";
  entryTime: string;
  exitTime: string;
  type: "임직원" | "방문객";
  purpose?: string;
}

const initialVehicles: Vehicle[] = [
  { id: "1", plateNumber: "12가 3456", ownerName: "홍길동", status: "주차중", entryTime: "09:10", exitTime: "-", type: "임직원" },
  { id: "2", plateNumber: "45다 6789", ownerName: "이미영", status: "출차", entryTime: "08:55", exitTime: "11:20", type: "방문객", purpose: "계약 미팅" },
  { id: "3", plateNumber: "78구 9012", ownerName: "김민수", status: "예약", entryTime: "-", exitTime: "-", type: "방문객", purpose: "기술 면접" },
  { id: "4", plateNumber: "11하 1111", ownerName: "박준철", status: "주차중", entryTime: "10:30", exitTime: "-", type: "임직원" },
  { id: "5", plateNumber: "22나 2222", ownerName: "송지은", status: "주차중", entryTime: "07:45", exitTime: "-", type: "임직원" },
  { id: "6", plateNumber: "33다 3333", ownerName: "최현우", status: "출차", entryTime: "09:15", exitTime: "10:45", type: "방문객", purpose: "설비 점검" },
];

// Generate parking spots (3 rows, 8 columns)
const TOTAL_SPOTS = 24;
const initialSpots = Array.from({ length: TOTAL_SPOTS }, (_, i) => ({
  id: i + 1,
  isOccupied: Math.random() > 0.4,
}));

export function ParkingManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("전체");
  const [spots] = useState(initialSpots);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    plateNumber: "",
    ownerName: "", 
    type: "방문객" as "임직원" | "방문객",
    status: "주차중" as "주차중" | "예약" | "출차",
    entryTime: "",
    exitTime: "",
    purpose: "" 
  });

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState<{
    plateNumber: string;
    ownerName: string;
    type: "임직원" | "방문객";
    purpose: string;
  }>({
    plateNumber: "",
    ownerName: "",
    type: "방문객",
    purpose: ""
  });

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = v.plateNumber.includes(searchQuery) || v.ownerName.includes(searchQuery);
      const matchesFilter = filterStatus === "전체" || v.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [vehicles, searchQuery, filterStatus]);

  const stats = {
    total: TOTAL_SPOTS,
    inUse: spots.filter(s => s.isOccupied).length,
    remaining: TOTAL_SPOTS - spots.filter(s => s.isOccupied).length,
    visitors: vehicles.filter(v => v.type === "방문객" && v.status === "주차중").length
  };

  const handleRegister = () => {
    if (!newVehicle.plateNumber || !newVehicle.ownerName) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    const vehicle: Vehicle = {
      id: (vehicles.length + 1).toString(),
      plateNumber: newVehicle.plateNumber,
      ownerName: newVehicle.ownerName,
      status: "예약",
      entryTime: "-",
      exitTime: "-",
      type: newVehicle.type,
      purpose: newVehicle.type === "방문객" ? newVehicle.purpose : undefined
    };

    setVehicles([vehicle, ...vehicles]);
    setIsRegisterOpen(false);
    setNewVehicle({ plateNumber: "", ownerName: "", type: "방문객", purpose: "" });
    toast.success("차량이 성공적으로 등록되었습니다.");
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    toast.success("차량이 목록에서 삭제되었습니다.");
  };

  const handleChangeStatus = (id: string, newStatus: Vehicle["status"]) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
    toast.success(`차량 상태가 '${newStatus}'(으)로 변경되었습니다.`);
  };

  const handleViewDetail = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setEditForm({ 
      plateNumber: vehicle.plateNumber,
      ownerName: vehicle.ownerName, 
      type: vehicle.type,
      status: vehicle.status,
      entryTime: vehicle.entryTime,
      exitTime: vehicle.exitTime,
      purpose: vehicle.purpose || "" 
    });
    setIsEditing(false);
    setIsDetailOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedVehicle) return;
    setVehicles(prev => prev.map(v => 
      v.id === selectedVehicle.id 
        ? { 
            ...v, 
            plateNumber: editForm.plateNumber,
            ownerName: editForm.ownerName, 
            type: editForm.type,
            status: editForm.status,
            entryTime: editForm.entryTime,
            exitTime: editForm.exitTime,
            purpose: editForm.purpose 
          } 
        : v
    ));
    setSelectedVehicle(prev => prev ? { 
      ...prev, 
      plateNumber: editForm.plateNumber,
      ownerName: editForm.ownerName, 
      type: editForm.type,
      status: editForm.status,
      entryTime: editForm.entryTime,
      exitTime: editForm.exitTime,
      purpose: editForm.purpose 
    } : null);
    setIsEditing(false);
    toast.success("차량 정보가 수정되었습니다.");
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">주차 관리 시스템</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-black" />
            <Input 
              placeholder="차량번호, 성함 검색" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[260px] h-12 pl-11 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black/5 font-bold"
            />
          </div>
          <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
            <DialogTrigger render={<Button className="h-12 px-8 bg-black text-white hover:bg-zinc-800 rounded-2xl font-bold gap-2 shadow-lg transition-transform active:scale-95" />}>
              <Plus className="w-4 h-4" />
              차량 신규 등록
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] bg-white rounded-[32px] p-8 border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">차량 신규 등록</DialogTitle>
                <DialogDescription className="text-gray-500">방문객 또는 임직원 차량을 시스템에 등록합니다.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6 font-sans">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">차량 번호</Label>
                  <Input 
                    value={newVehicle.plateNumber}
                    onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })}
                    placeholder="예: 12가 3456" 
                    className="h-12 bg-gray-50 border-none rounded-2xl px-5 focus:ring-2 focus:ring-black/5 text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">소유자 / 방문자 성함</Label>
                  <Input 
                    value={newVehicle.ownerName}
                    onChange={(e) => setNewVehicle({ ...newVehicle, ownerName: e.target.value })}
                    placeholder="이름을 입력하세요" 
                    className="h-12 bg-gray-50 border-none rounded-2xl px-5 focus:ring-2 focus:ring-black/5 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">구분</Label>
                  <Select 
                    value={newVehicle.type} 
                    onValueChange={(val: "임직원" | "방문객") => setNewVehicle({ ...newVehicle, type: val })}
                  >
                    <SelectTrigger className="h-12 bg-gray-50 border-none rounded-2xl px-5 focus:ring-2 focus:ring-black/5 font-bold">
                      <SelectValue placeholder="구분 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-100 rounded-2xl font-bold">
                      <SelectItem value="임직원">임직원</SelectItem>
                      <SelectItem value="방문객">방문객</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newVehicle.type === "방문객" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">방문 목적</Label>
                    <Input 
                      value={newVehicle.purpose}
                      onChange={(e) => setNewVehicle({ ...newVehicle, purpose: e.target.value })}
                      placeholder="방문 목적을 입력하세요 (예: 비즈니스 미팅)" 
                      className="h-12 bg-gray-50 border-none rounded-2xl px-5 focus:ring-2 focus:ring-black/5 font-medium"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsRegisterOpen(false)} className="rounded-2xl font-bold">취소</Button>
                <Button onClick={handleRegister} className="bg-black text-white hover:bg-zinc-800 rounded-2xl font-bold px-8 h-12 shadow-xl">등록하기</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "전체 구역", id: "전체", value: stats.total, unit: "구역", color: "text-zinc-900" },
          { label: "실시간 사용", id: "주차중", value: stats.inUse, unit: "주차중", color: "text-emerald-500" },
          { label: "금일 예약", id: "예약", value: vehicles.filter(v => v.status === "예약").length, unit: "예정", color: "text-indigo-600" },
          { label: "방문 차량", id: "방문", value: stats.visitors, unit: "방문객", color: "text-orange-500" },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between"
          >
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">{stat.label}</span>
            <div className="flex items-baseline gap-1.5">
              <span className={cn("text-4xl font-black font-mono leading-none tracking-tighter", stat.color)}>{stat.value}</span>
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{stat.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left: Parking Map (ParkingZoneMap 컴포넌트로 분리. 묶음 4 에서 useParkingZoneMap hook 연결.) */}
        <div className="xl:col-span-12">
          <ParkingZoneMap />
        </div>

        {/* Right / Bottom: Vehicle List */}
        <div className="xl:col-span-12">
          <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-12 px-8 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 font-black text-lg gap-4 flex items-center justify-center transition-all outline-none">
                    차량 리스트
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filterStatus}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-white border-gray-100 rounded-2xl w-48 p-2 z-50 shadow-2xl overflow-hidden mt-2">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-2">상태별 필터</DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-gray-100 mb-1 mx-2" />
                    {["전체", "주차중", "예약", "출차"].map(status => (
                      <DropdownMenuItem 
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={cn(
                          "rounded-xl px-4 py-2.5 font-bold transition-colors cursor-pointer text-sm",
                          filterStatus === status ? "bg-black text-white" : "hover:bg-gray-50 text-gray-600"
                        )}
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">전체 기록</span>
                <span className="text-2xl font-black font-mono tracking-tighter text-gray-900">{filteredVehicles.length}</span>
              </div>
            </div>

            <div className="overflow-x-auto -mx-2">
              <div className="min-w-[1000px] p-2">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">차량 정보</th>
                      <th className="text-left py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">성함 / 방문목적</th>
                      <th className="text-left py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">멤버십</th>
                      <th className="text-left py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">상태</th>
                      <th className="text-left py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">엔트리 로그</th>
                      <th className="text-right py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {filteredVehicles.map((v, i) => (
                        <motion.tr 
                          key={v.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: i * 0.05 }}
                          className="group border-b border-gray-50 hover:bg-gray-50/50 transition-all"
                        >
                          <td className="py-6 px-4">
                            <span className="font-black text-xl text-gray-900 group-hover:text-indigo-600 transition-colors font-mono tracking-tighter">{v.plateNumber}</span>
                          </td>
                          <td className="py-6 px-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-gray-900 text-sm">{v.ownerName}</span>
                              {v.purpose && <span className="text-[10px] text-gray-400 font-medium tracking-tight uppercase">{v.purpose}</span>}
                            </div>
                          </td>
                          <td className="py-6 px-4">
                            <Badge variant="outline" className={cn(
                              "rounded-lg font-black text-[10px] px-2 py-0.5 border-none uppercase tracking-wider",
                              v.type === "임직원" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                            )}>
                              {v.type}
                            </Badge>
                          </td>
                          <td className="py-6 px-4">
                            <div className="flex items-center gap-2">
                              {v.status === "주차중" && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                              <span className={cn(
                                "font-black text-xs uppercase tracking-widest",
                                v.status === "주차중" ? "text-emerald-500" : 
                                v.status === "예약" ? "text-indigo-500" : "text-gray-400"
                              )}>
                                {v.status}
                              </span>
                            </div>
                          </td>
                          <td className="py-6 px-4">
                            <div className="flex items-center gap-4 text-xs font-mono font-bold text-gray-500">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-gray-300 font-black tracking-tighter px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100">입차</span>
                                {v.entryTime}
                              </div>
                              {v.exitTime !== "-" && (
                                <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
                                  <span className="text-[9px] text-gray-300 font-black tracking-tighter px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100">출차</span>
                                  {v.exitTime}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-6 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-gray-100 group/btn" />}>
                                <MoreHorizontal className="w-4 h-4 text-gray-400 group-hover/btn:text-gray-900" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 p-2 z-[100] shadow-2xl font-sans bg-white border border-gray-100">
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-2">메뉴</DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator className="mb-1 mx-2 bg-gray-100" />
                                <DropdownMenuItem 
                                  onClick={() => handleViewDetail(v)}
                                  className="rounded-xl px-4 py-2.5 font-bold transition-colors cursor-pointer text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                >
                                  <Info className="w-3.5 h-3.5 text-gray-400" />
                                  상세 정보
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 mx-2 bg-gray-100" />
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-2">상태 변경</DropdownMenuLabel>
                                </DropdownMenuGroup>
                                {["주차중", "예약", "출차"].map((status) => (
                                  <DropdownMenuItem 
                                    key={status}
                                    onClick={() => handleChangeStatus(v.id, status as Vehicle["status"])}
                                    className={cn(
                                      "rounded-xl px-4 py-2.5 font-bold transition-colors cursor-pointer text-sm",
                                      v.status === status ? "bg-black text-white" : "hover:bg-gray-50 text-gray-700 font-bold"
                                    )}
                                  >
                                    {status}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator className="my-1 mx-2 bg-gray-100" />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteVehicle(v.id)}
                                  className="rounded-xl px-4 py-2.5 font-bold transition-colors cursor-pointer text-sm text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  차량 삭제
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              {filteredVehicles.length === 0 && (
                <div className="py-20 text-center space-y-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-200" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">검색 결과가 없습니다</h4>
                  <p className="text-gray-400 text-sm">입력하신 차량번호 또는 이름을 다시 확인해주세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={(open) => {
        setIsDetailOpen(open);
        if (!open) setIsEditing(false);
      }}>
        <DialogContent className="sm:max-w-[480px] bg-white rounded-[32px] p-8 border-none shadow-2xl font-sans">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border",
                  (isEditing ? editForm.type : selectedVehicle?.type) === "임직원" ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-orange-50 border-orange-100 text-orange-600"
                )}>
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  {isEditing ? (
                    <Input 
                      value={editForm.plateNumber}
                      onChange={(e) => setEditForm({ ...editForm, plateNumber: e.target.value })}
                      className="h-9 border-gray-200 rounded-xl font-bold bg-white text-lg w-32"
                    />
                  ) : (
                    <DialogTitle className="text-2xl font-black tracking-tight">{selectedVehicle?.plateNumber}</DialogTitle>
                  )}
                  <DialogDescription className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                    {isEditing ? (
                      <Select 
                        value={editForm.type} 
                        onValueChange={(val: "임직원" | "방문객") => setEditForm({ ...editForm, type: val })}
                      >
                        <SelectTrigger className="h-6 w-24 p-0 bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-indigo-600 focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-100 rounded-xl font-bold">
                          <SelectItem value="임직원">임직원</SelectItem>
                          <SelectItem value="방문객">방문객</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <>{selectedVehicle?.type} 차량 상세 정보</>
                    )}
                  </DialogDescription>
                </div>
              </div>
              {!isEditing && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl font-bold text-xs gap-1.5 hover:bg-gray-50"
                >
                  <Settings className="w-3.5 h-3.5" />
                  수정
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="py-8 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">차량 소유자</span>
                {isEditing ? (
                  <Input 
                    value={editForm.ownerName}
                    onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                    className="h-10 border-gray-100 rounded-xl font-bold bg-gray-50"
                  />
                ) : (
                  <span className="text-lg font-black text-gray-900">{selectedVehicle?.ownerName}</span>
                )}
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">현재 상태</span>
                {isEditing ? (
                  <Select 
                    value={editForm.status} 
                    onValueChange={(val: "주차중" | "예약" | "출차") => setEditForm({ ...editForm, status: val })}
                  >
                    <SelectTrigger className="h-10 border-gray-100 rounded-xl font-bold bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-100 rounded-xl font-bold">
                      <SelectItem value="주차중">주차중</SelectItem>
                      <SelectItem value="예약">예약</SelectItem>
                      <SelectItem value="출차">출차</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={cn(
                    "font-black text-[10px] px-3 py-1 rounded-full border-none",
                    selectedVehicle?.status === "주차중" ? "bg-emerald-500 text-white" :
                    selectedVehicle?.status === "예약" ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-600"
                  )}>
                    {selectedVehicle?.status}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">입차 시간</span>
                {isEditing ? (
                  <Input 
                    value={editForm.entryTime}
                    onChange={(e) => setEditForm({ ...editForm, entryTime: e.target.value })}
                    placeholder="예: 09:10 or -"
                    className="h-10 border-gray-100 rounded-xl font-bold bg-gray-50"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900 font-bold">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {selectedVehicle?.entryTime || "-"}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">출차 시간</span>
                {isEditing ? (
                  <Input 
                    value={editForm.exitTime}
                    onChange={(e) => setEditForm({ ...editForm, exitTime: e.target.value })}
                    placeholder="예: 11:20 or -"
                    className="h-10 border-gray-100 rounded-xl font-bold bg-gray-50"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900 font-bold">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {selectedVehicle?.exitTime || "-"}
                  </div>
                )}
              </div>
            </div>

            {(selectedVehicle?.purpose || isEditing) && (
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-200 shadow-sm shrink-0">
                  <Info className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">방문 목적</span>
                  {isEditing ? (
                    <Input 
                      value={editForm.purpose}
                      onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
                      className="h-10 border-gray-100 rounded-xl font-medium bg-white text-sm"
                    />
                  ) : (
                    <p className="text-sm font-bold text-gray-700 leading-relaxed">{selectedVehicle?.purpose || "입력된 목적이 없습니다."}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsEditing(false)} 
                  className="flex-1 rounded-2xl h-12 font-bold"
                >
                  취소
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  className="flex-1 rounded-2xl h-12 font-bold bg-black text-white hover:bg-zinc-800 shadow-lg"
                >
                  변경사항 저장
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailOpen(false)} 
                  className="flex-1 rounded-2xl h-12 font-bold border-gray-100"
                >
                  닫기
                </Button>
                <Button 
                  className="flex-1 rounded-2xl h-12 font-bold bg-black text-white hover:bg-zinc-800"
                  onClick={() => setIsDetailOpen(false)}
                >
                  확인
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
