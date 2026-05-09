import React, { useState, useMemo } from "react";
import { 
  Search, Plus, MoreHorizontal, ShieldAlert, Package, 
  Settings, History, AlertTriangle, Monitor, Smartphone, 
  Wrench, Info, ChevronLeft, ChevronRight, X, LayoutGrid, ListFilter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
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

interface Asset {
  id: string;
  assetId: string;
  name: string;
  category: string;
  authorizedArea: string;
  lastGate: string;
  status: "구역 내 위치" | "비인가 반출 시도" | "보안 위반 (차단)" | "정상 위치" | "태그 미감지" | "점검 이동 (승인됨)" | "반출 승인됨";
}

const initialAssets: Asset[] = [
  { id: "1", assetId: "AST-26-001", name: 'MacBook Pro 16"', category: "IT 기기", authorizedArea: "제1연구소 입구", lastGate: "제1연구소 입구", status: "구역 내 위치" },
  { id: "2", assetId: "AST-26-002", name: 'iPad Pro 12.9"', category: "IT 기기", authorizedArea: "1층 정문 게이트", lastGate: "1층 정문 게이트", status: "비인가 반출 시도" },
  { id: "3", assetId: "AST-26-003", name: "테스팅 서버팩 A", category: "서버 장비", authorizedArea: "3층 서버실 입구", lastGate: "3층 서버실 입구", status: "구역 내 위치" },
  { id: "4", assetId: "AST-26-004", name: "외장 SSD 2TB (보안)", category: "저장 매체", authorizedArea: "지하 주차장 입구", lastGate: "지하 주차장 입구", status: "보안 위반 (차단)" },
  { id: "5", assetId: "AST-26-005", name: "빔프로젝터 4K", category: "비품", authorizedArea: "대회의실 A 입구", lastGate: "대회의실 A 입구", status: "구역 내 위치" },
  { id: "6", assetId: "AST-26-006", name: "개발용 워크스테이션", category: "IT 기기", authorizedArea: "개발 본부 입구", lastGate: "개발 본부 입구", status: "구역 내 위치" },
  { id: "7", assetId: "AST-26-007", name: "시제품 프로토타입", category: "중요 자산", authorizedArea: "-", lastGate: "-", status: "태그 미감지" },
  { id: "8", assetId: "AST-26-008", name: "정밀 측정기기 B", category: "장비", authorizedArea: "연구동 후문", lastGate: "연구동 후문", status: "점검 이동 (승인됨)" },
  { id: "9", assetId: "AST-26-009", name: "무선 AP 허브", category: "네트워크", authorizedArea: "2층 사무실 복도", lastGate: "2층 사무실 복도", status: "정상 위치" },
  { id: "10", assetId: "AST-26-010", name: "법인용 공용 노트북", category: "IT 기기", authorizedArea: "1층 정문 게이트", lastGate: "1층 정문 게이트", status: "반출 승인됨" },
  { id: "11", assetId: "AST-26-011", name: 'LG Gram 17"', category: "IT 기기", authorizedArea: "제2연구소 서쪽", lastGate: "제2연구소 서쪽", status: "구역 내 위치" },
  { id: "12", assetId: "AST-26-012", name: "NAS Storage 40TB", category: "서버 장비", authorizedArea: "서버실 메인 랙", lastGate: "서버실 입구", status: "구역 내 위치" },
  { id: "13", assetId: "AST-26-013", name: "암호화 USB 512GB", category: "저장 매체", authorizedArea: "정보보안실", lastGate: "정보보안실", status: "비인가 반출 시도" },
  { id: "14", assetId: "AST-26-014", name: "Dell Precision T7920", category: "IT 기기", authorizedArea: "AI 솔루션 센터", lastGate: "AI 솔루션 센터", status: "구역 내 위치" },
  { id: "15", assetId: "AST-26-015", name: "DSLR Canon EOS R5", category: "비품", authorizedArea: "홍보관 스튜디오", lastGate: "홍보관", status: "구역 내 위치" },
  { id: "16", assetId: "AST-26-016", name: "특수 금형 세트", category: "장비", authorizedArea: "제조 공정실", lastGate: "제조 공정실", status: "반출 승인됨" },
  { id: "17", assetId: "AST-26-017", name: "Wacom Cintiq Pro 24", category: "IT 기기", authorizedArea: "디자인팀 스튜디오", lastGate: "디자인팀 입구", status: "구역 내 위치" },
  { id: "18", assetId: "AST-26-018", name: "VR Headset Index", category: "IT 기기", authorizedArea: "메타버스 랩", lastGate: "메타버스 랩", status: "보안 위반 (차단)" },
  { id: "19", assetId: "AST-26-019", name: "방화벽 장비 CheckPoint", category: "네트워크", authorizedArea: "통신실", lastGate: "통신실", status: "구역 내 위치" },
  { id: "20", assetId: "AST-26-020", name: "레이저 마킹기", category: "장비", authorizedArea: "시제품 제작 센터", lastGate: "연구동 후문", status: "점검 이동 (승인됨)" },
  { id: "21", assetId: "AST-26-021", name: "3D 프린터 Formlabs", category: "비품", authorizedArea: "디자인 랩", lastGate: "디자인 랩", status: "정상 위치" },
  { id: "22", assetId: "AST-26-022", name: "오실로스코프 Tektronix", category: "장비", authorizedArea: "전기회로 실험실", lastGate: "전기회로 실험실", status: "구역 내 위치" },
  { id: "23", assetId: "AST-26-023", name: "삼성 Flip 2 85인치", category: "비품", authorizedArea: "이사회 회의실", lastGate: "관리동 4층", status: "구역 내 위치" },
  { id: "24", assetId: "AST-26-024", name: "NVIDIA H100 GPU", category: "중요 자산", authorizedArea: "GPU 클러스터실", lastGate: "GPU 클러스터실", status: "태그 미감지" },
  { id: "25", assetId: "AST-26-025", name: "Cisco Catalyst Switch", category: "네트워크", authorizedArea: "IDF실-02", lastGate: "IDF실-02", status: "구역 내 위치" },
  { id: "26", assetId: "AST-26-026", name: "전자현미경 Olympus", category: "장비", authorizedArea: "나노 소재 연구실", lastGate: "나노 소재 연구실", status: "구역 내 위치" },
  { id: "27", assetId: "AST-26-027", name: "환경 테스트 챔버", category: "장비", authorizedArea: "신뢰성 평가 센터", lastGate: "신뢰성 평가 센터", status: "점검 이동 (승인됨)" },
  { id: "28", assetId: "AST-26-028", name: "모바일 워크스테이션 ZBook", category: "IT 기기", authorizedArea: "현장 엔지니어링실", lastGate: "1층 동측 입구", status: "구역 내 위치" },
  { id: "29", assetId: "AST-26-029", name: "AI 서브 프로세서", category: "중요 자산", authorizedArea: "-", lastGate: "-", status: "태그 미감지" },
  { id: "30", assetId: "AST-26-030", name: "대용량 UPS 배터리", category: "장비", authorizedArea: "전력관리실", lastGate: "전력관리실", status: "정상 위치" },
];

export function InventoryManagement() {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("전체");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRecentOnly, setIsRecentOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const assetsPerPage = 10;

  // New asset form
  const [newAsset, setNewAsset] = useState({
    name: "",
    category: "",
    serialNumber: "",
    rfidTag: "",
    authorizedArea: ""
  });

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             asset.assetId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArea = selectedArea === "전체" || asset.authorizedArea.includes(selectedArea);
      const matchesCategory = selectedCategory === "전체" || asset.category === selectedCategory;
      
      let matchesStatus = selectedStatus === "전체" || asset.status === selectedStatus;
      if (selectedStatus === "보안 위반") {
        matchesStatus = asset.status.includes("위반") || asset.status.includes("비인가");
      } else if (selectedStatus === "점검 중") {
        matchesStatus = asset.status.includes("점검");
      }

      const matchesRecent = !isRecentOnly || parseInt(asset.id) > 10;
      
      return matchesSearch && matchesArea && matchesCategory && matchesStatus && matchesRecent;
    });
  }, [assets, searchQuery, selectedArea, selectedCategory, selectedStatus, isRecentOnly]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedArea, selectedCategory, selectedStatus, isRecentOnly]);

  const totalPages = Math.ceil(filteredAssets.length / assetsPerPage);
  const paginatedAssets = filteredAssets.slice((currentPage - 1) * assetsPerPage, currentPage * assetsPerPage);

  const stats = {
    total: assets.length,
    security: assets.filter(a => a.status.includes("위반") || a.status.includes("비인가")).length,
    repair: assets.filter(a => a.status.includes("점검")).length,
    recent: assets.filter(a => parseInt(a.id) > 10).length
  };

  const handleRegister = () => {
    if (!newAsset.name || !newAsset.category) {
      toast.error("필수 정보를 모두 입력해주세요.");
      return;
    }

    const asset: Asset = {
      id: (assets.length + 1).toString(),
      assetId: `AST-26-${String(assets.length + 1).padStart(3, '0')}`,
      name: newAsset.name,
      category: newAsset.category,
      authorizedArea: newAsset.authorizedArea || "-",
      lastGate: "-",
      status: "정상 위치"
    };

    setAssets([...assets, asset]);
    setIsRegisterOpen(false);
    setNewAsset({ name: "", category: "", serialNumber: "", rfidTag: "", authorizedArea: "" });
    toast.success("신규 자산이 등록되었습니다.");
    
    // Move to the last page to show the new item
    const newTotalAssets = assets.length + 1;
    const newTotalPages = Math.ceil(newTotalAssets / assetsPerPage);
    setCurrentPage(newTotalPages);
  };

  const handleCardClick = (type: string) => {
    setIsRecentOnly(false);
    if (type === "all") {
      setSelectedStatus("전체");
      setSelectedArea("전체");
      setSelectedCategory("전체");
      setSearchQuery("");
      toast.info("모든 자산을 표시합니다.");
    } else if (type === "security") {
      setSelectedStatus("보안 위반");
      toast.warning("보안 위반 자산으로 필터링되었습니다.");
    } else if (type === "repair") {
      setSelectedStatus("점검 이동 (승인됨)");
      toast.info("점검 중인 자산으로 필터링되었습니다.");
    } else if (type === "recent") {
      setIsRecentOnly(true);
      toast.info("최근 등록된 자산으로 필터링되었습니다.");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">재고 및 자산 관리</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="자산 번호 또는 이름 검색..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[280px] h-10 pl-10 bg-white border-none rounded-xl text-sm focus:ring-2 focus:ring-black/5"
              />
            </div>
            <Button className="h-10 px-6 bg-zinc-900 text-white rounded-xl font-bold shadow-md hover:bg-black transition-colors">
              검색
            </Button>
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
              <DialogTrigger render={<Button variant="outline" className="h-10 px-6 rounded-xl border-gray-200 font-bold gap-2" />}>
                <Plus className="w-4 h-4" />
                자산 신규 등록
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] bg-white rounded-[32px] p-10 border-none shadow-2xl">
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-2xl font-black">자산 신규 등록</DialogTitle>
                  <DialogDescription className="text-gray-500 font-medium">실시간 추적을 위해 새로운 자산의 정보를 등록합니다.</DialogDescription>
                </DialogHeader>
                <div className="space-y-8 py-6 font-sans">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">자산명</Label>
                      <Input 
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                        placeholder="자산 이름을 입력하세요 (예: MacBook Pro 2024)" 
                        className="h-14 bg-gray-50 border-none rounded-2xl px-6 focus:ring-2 focus:ring-black/5 font-bold text-lg"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">카테고리</Label>
                        <Select onValueChange={(val) => setNewAsset({ ...newAsset, category: val })}>
                          <SelectTrigger className="h-12 bg-gray-50 border-none rounded-2xl px-5 font-bold">
                            <SelectValue placeholder="카테고리 선택" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-100 rounded-2xl font-bold">
                            {["IT 기기", "서버 장비", "저장 매체", "비품", "중요 자산", "장비", "네트워크"].map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">시리얼 번호 (S/N)</Label>
                        <Input 
                          value={newAsset.serialNumber}
                          onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                          placeholder="S/N 입력" 
                          className="h-12 bg-gray-50 border-none rounded-2xl px-5 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-black text-black">보안 설정</h4>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">RFID 태그 ID</Label>
                      <Input 
                        value={newAsset.rfidTag}
                        onChange={(e) => setNewAsset({ ...newAsset, rfidTag: e.target.value })}
                        placeholder="RFID 태그 스캔 또는 직접 입력" 
                        className="h-12 bg-gray-50 border-none rounded-2xl px-5 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">허용 구역 설정</Label>
                      <Input 
                        value={newAsset.authorizedArea}
                        onChange={(e) => setNewAsset({ ...newAsset, authorizedArea: e.target.value })}
                        placeholder="반출 금지 구역 설정 (예: 제1연구소)" 
                        className="h-12 bg-gray-50 border-none rounded-2xl px-5"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-x-4">
                  <Button variant="ghost" onClick={() => setIsRegisterOpen(false)} className="rounded-2xl font-bold h-14 flex-1">취소</Button>
                  <Button onClick={handleRegister} className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl font-bold h-14 flex-1 shadow-xl shadow-indigo-100">자산 등록하기</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { id: "all", label: "전체 자산 수", value: `${stats.total}개`, delta: "+12", icon: Package, color: "text-zinc-600", bg: "bg-white" },
          { id: "security", label: "실시간 보안 위반", value: `${stats.security}건`, delta: "-2", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50/50 border-red-100" },
          { id: "repair", label: "수리/점검 중 자산", value: `${stats.repair}개`, delta: "0", icon: Wrench, color: "text-orange-500", bg: "bg-white" },
          { id: "recent", label: "신규 등록 (최근 7일)", value: `${stats.recent}개`, delta: "+4", icon: Plus, color: "text-indigo-600", bg: "bg-white" }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleCardClick(stat.id)}
            className={cn(
              "p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between h-48 cursor-pointer group transition-all hover:scale-[1.02] active:scale-[0.98]",
              stat.bg,
              stat.id === "recent" ? "hover:border-indigo-200" : "hover:border-gray-300",
              isRecentOnly && stat.id === "recent" ? "ring-2 ring-indigo-500 border-transparent" : "",
              !isRecentOnly && selectedStatus === "보안 위반" && stat.id === "security" ? "ring-2 ring-red-500 border-transparent" : "",
              !isRecentOnly && selectedStatus === "점검 이동 (승인됨)" && stat.id === "repair" ? "ring-2 ring-orange-500 border-transparent" : ""
            )}
          >
            <div className="flex items-center justify-between">
              <div 
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 border border-gray-100 group-hover:scale-110 transition-transform", 
                  stat.id === "recent" ? "cursor-pointer hover:bg-indigo-50 hover:border-indigo-100" : "",
                  stat.color
                )}
                onClick={(e) => {
                  if (stat.id === "recent") {
                    e.stopPropagation();
                    setIsRegisterOpen(true);
                  }
                }}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={cn(
                "text-[10px] font-black px-3 py-1 rounded-full",
                stat.delta.startsWith('+') ? "bg-green-50 text-green-600" : stat.delta === '0' ? "bg-gray-50 text-gray-400" : "bg-red-50 text-red-500"
              )}>
                {stat.delta}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-black font-sans uppercase tracking-[0.2em] text-gray-400 block mb-1">{stat.label}</span>
              <span className={cn("text-3xl font-black tracking-tighter", stat.color.includes('zinc') ? 'text-zinc-900' : stat.color)}>{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Table Content */}
      <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-black">실시간 자산 리스트</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-[160px] h-10 bg-gray-50 border-none rounded-xl text-xs font-bold px-4">
                <SelectValue placeholder="구역 선택" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100 rounded-xl font-bold">
                <SelectItem value="전체">모든 구역</SelectItem>
                {["제1연구소", "제2연구소", "서버실", "정보보안실", "홍보관", "AI 솔루션 센터", "나노 소재 연구실", "디자인 랩", "GPU 클러스터실"].map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px] h-10 bg-gray-50 border-none rounded-xl text-xs font-bold px-4">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100 rounded-xl font-bold">
                <SelectItem value="전체">모든 카테고리</SelectItem>
                {["IT 기기", "서버 장비", "저장 매체", "비품", "중요 자산", "장비", "네트워크"].map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[160px] h-10 bg-gray-50 border-none rounded-xl text-xs font-bold px-4">
                <SelectValue placeholder="보안 상태" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100 rounded-xl font-bold">
                <SelectItem value="전체">모든 상태</SelectItem>
                <SelectItem value="구역 내 위치">구역 내 위치</SelectItem>
                <SelectItem value="보안 위반">보안 위반 (통합)</SelectItem>
                <SelectItem value="태그 미감지">태그 미감지</SelectItem>
                <SelectItem value="점검 이동 (승인됨)">점검 중</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">자산 ID</th>
                <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">자산명</th>
                <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">카테고리</th>
                <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">허용 구역</th>
                <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">최종 감지 게이트</th>
                <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">상태</th>
                <th className="text-right py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">관리</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssets.map((asset, i) => (
                <motion.tr 
                  key={asset.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-5 px-2 font-mono text-xs font-bold text-gray-400">{asset.assetId}</td>
                  <td className="py-5 px-2">
                    <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{asset.name}</span>
                  </td>
                  <td className="py-5 px-2">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100/50 px-2.5 py-1 rounded-lg">{asset.category}</span>
                  </td>
                  <td className="py-5 px-2">
                    <span className="text-sm font-medium text-gray-600">{asset.authorizedArea}</span>
                  </td>
                  <td className="py-5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span className="text-sm font-bold text-gray-700">{asset.lastGate}</span>
                    </div>
                  </td>
                  <td className="py-5 px-2">
                    <Badge className={cn(
                      "rounded-lg font-bold border-none px-3 py-1 text-[11px]",
                      asset.status.includes('위반') || asset.status.includes('비인가') ? "bg-red-50 text-red-500" :
                      asset.status.includes('미감지') ? "bg-orange-50 text-orange-600" :
                      asset.status.includes('정상') || asset.status.includes('구역 내') ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                    )}>
                      {asset.status}
                    </Badge>
                  </td>
                  <td className="py-5 px-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-gray-100 group/btn" />}>
                        <MoreHorizontal className="w-4 h-4 text-gray-400 group-hover/btn:text-gray-900" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-gray-100 rounded-2xl w-40 p-2 z-50 shadow-xl overflow-hidden">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-2">자산 관리</DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-gray-100 mb-1" />
                        <DropdownMenuItem className="rounded-xl px-3 py-2 font-bold cursor-pointer hover:bg-gray-50 outline-none" onClick={() => toast.info(`${asset.name} 상세 정보 조회`)}>
                          상세 보기
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl px-3 py-2 font-bold cursor-pointer hover:bg-gray-50" onClick={() => toast.info(`${asset.name} 수정`)}>
                          자산 수정
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100 my-1" />
                        <DropdownMenuItem className="rounded-xl px-3 py-2 font-bold cursor-pointer text-red-500 hover:bg-red-50" onClick={() => toast.error(`${asset.name} 삭제 처리가 진행됩니다.`)}>
                          자산 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {paginatedAssets.length === 0 && (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-200" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">검색 결과가 없습니다</h4>
              <p className="text-gray-400 text-sm">필터 조건을 다시 확인해주세요.</p>
            </div>
          )}
        </div>

        {/* Pagination logic */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-50">
            <p className="text-xs font-bold text-gray-400">총 {filteredAssets.length}개의 자산이 검색되었습니다 ({currentPage} / {totalPages} 페이지)</p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="w-8 h-8 rounded-lg border-gray-100" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Button 
                    key={p} 
                    variant={p === currentPage ? "default" : "ghost"} 
                    onClick={() => setCurrentPage(p)}
                    className={cn("w-8 h-8 rounded-lg font-bold text-xs p-0", p === currentPage ? "bg-zinc-900 text-white" : "text-gray-400")}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-8 h-8 rounded-lg border-gray-100"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
