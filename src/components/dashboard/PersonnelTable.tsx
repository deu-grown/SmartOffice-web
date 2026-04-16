import React, { useState, useMemo } from "react";
import { Search, X, ChevronDown, UserPlus, Users, Edit2, Trash2, MoreVertical, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  contact: string;
  gender: "남" | "여";
  workHours: number;
  expectedSalary: number;
  status: "재직" | "휴직" | "퇴사";
  permissions: string[];
  rfidUid?: string; // REQ-A-006
}

const initialEmployees: Employee[] = [
  { id: "1", name: "김호탈", employeeId: "37821", department: "기획부", position: "부장", contact: "010-1234-5678", gender: "남", workHours: 160, expectedSalary: 5500000, status: "재직", permissions: ["ADMIN"], rfidUid: "A1-B2-C3-D4" },
  { id: "2", name: "강덕순", employeeId: "86562", department: "개발본부", position: "과장", contact: "010-2345-6789", gender: "여", workHours: 152, expectedSalary: 4200000, status: "재직", permissions: ["USER"], rfidUid: "E5-F6-G7-H8" },
  { id: "3", name: "임호탈", employeeId: "16561", department: "프론트", position: "대리", contact: "010-3456-7890", gender: "남", workHours: 0, expectedSalary: 0, status: "휴직", permissions: ["USER"] },
  { id: "4", name: "강경덕", employeeId: "89981", department: "백엔드", position: "주임", contact: "010-4567-8901", gender: "남", workHours: 140, expectedSalary: 3200000, status: "재직", permissions: ["USER"] },
  { id: "5", name: "곽순호", employeeId: "48484", department: "시설관리", position: "사원", contact: "010-5678-9012", gender: "남", workHours: 168, expectedSalary: 2800000, status: "재직", permissions: ["USER"] },
  { id: "6", name: "윤종광", employeeId: "84655", department: "보안", position: "인턴", contact: "010-6789-0123", gender: "남", workHours: 120, expectedSalary: 2100000, status: "재직", permissions: ["USER"] },
  // Generating 24 more mock data for pagination (Total 30)
  ...[
    "김민준", "이서준", "박도윤", "최예준", "정주원", "유시우", "조하준", "장지호", "임도현", "한건우",
    "박지민", "김서연", "이서윤", "최하윤", "정지우", "유윤서", "조채원", "장민서", "임지유", "한다은",
    "김도윤", "이시우", "박하준", "최주원"
  ].map((name, i) => ({
    id: (i + 7).toString(),
    name: name,
    employeeId: (Math.floor(10000 + Math.random() * 90000)).toString(),
    department: ["기획부", "개발본부", "프론트", "백엔드", "시설관리", "보안", "인사팀", "마케팅"][Math.floor(Math.random() * 8)],
    position: ["사원", "주임", "대리", "과장", "차장", "부장"][Math.floor(Math.random() * 6)],
    contact: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    gender: i >= 10 && i < 20 ? "여" : "남" as "남" | "여",
    workHours: Math.floor(Math.random() * 180),
    expectedSalary: Math.floor(2000000 + Math.random() * 4000000),
    status: ["재직", "휴직", "퇴사"][Math.floor(Math.random() * 3)] as "재직" | "휴직" | "퇴사",
    permissions: ["USER"],
  }))
];

const ITEMS_PER_PAGE = 10;

interface PersonnelTableProps {
  onTabChange?: (tab: any) => void;
  onAddGuest?: (guest: any) => void;
}

export function PersonnelTable({ onTabChange, onAddGuest }: PersonnelTableProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("전체");
  const [filterDepartment, setFilterDepartment] = useState<string>("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Stats for REQ-U-002
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "재직").length;
  const attendanceRate = totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0;
  const totalWorkHours = employees.reduce((acc, curr) => acc + curr.workHours, 0);
  const totalExpectedSalary = employees.reduce((acc, curr) => acc + curr.expectedSalary, 0);

  const departments = useMemo(() => ["전체", ...Array.from(new Set(employees.map(e => e.department)))], [employees]);
  const statuses = ["전체", "재직", "휴직", "퇴사"];

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "전체" || emp.status === filterStatus;
      const matchesDept = filterDepartment === "전체" || emp.department === filterDepartment;
      
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [employees, searchTerm, filterStatus, filterDepartment]);

  const totalPages = Math.max(Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE), 10);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterDepartment]);

  const handleDelete = (id: string, name: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    toast.success(`${name} 직원의 정보가 완전히 삭제되었습니다.`);
  };

  const handleSaveEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEmp: any = {
      name: formData.get("name"),
      employeeId: formData.get("employeeId"),
      department: formData.get("department"),
      position: formData.get("position"),
      contact: formData.get("contact"),
      gender: formData.get("gender"),
      status: formData.get("status") || "재직",
      workHours: Number(formData.get("workHours")) || 0,
      expectedSalary: Number(formData.get("expectedSalary")) || 0,
      permissions: ["USER"],
    };

    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? { ...newEmp, id: emp.id } : emp));
      toast.success("직원 정보가 수정되었습니다.");
      setEditingEmployee(null);
    } else {
      const id = (employees.length + 1).toString();
      setEmployees(prev => [...prev, { ...newEmp, id }]);
      toast.success("신규 직원이 등록되었습니다.");
      setIsAddModalOpen(false);
    }
  };

  const handleSaveGuest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newGuest = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      host: formData.get("host") as string,
      details: formData.get("details") as string,
      status: formData.get("status") as any,
      entryTime: formData.get("entryTime") as string || "--:--",
      exitTime: formData.get("exitTime") as string || "-",
      date: formData.get("date") as string,
    };

    if (onAddGuest) onAddGuest(newGuest);
    
    toast.success("게스트가 등록되었습니다.", {
      description: "게스트 관리 페이지에서 현황을 확인하실 수 있습니다.",
    });
    setIsGuestModalOpen(false);
    if (onTabChange) onTabChange("게스트 관리");
  };

  return (
    <div className="space-y-8">
      {/* Summary Stats (REQ-U-002) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">전체 출근율</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-black">{attendanceRate}%</span>
            <span className="text-green-500 text-xs font-bold">↑ 2%</span>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">총 누적 근무</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-black">{totalWorkHours}h</span>
            <span className="text-gray-400 text-xs font-medium">이번 달</span>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">예상 총 급여</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-black">₩{(totalExpectedSalary / 10000).toLocaleString()}만</span>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">부서 수</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-black">8</span>
            <span className="text-gray-400 text-xs font-medium">개 부서</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-3xl">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="이름, 사번, 부서 검색" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-white border-gray-100 text-black h-12 rounded-2xl focus-visible:ring-black/5 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-full md:w-32 h-12 bg-white border-gray-100 rounded-xl shadow-sm">
                <SelectValue placeholder="부서" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100 text-black">
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-32 h-12 bg-white border-gray-100 rounded-xl shadow-sm">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100 text-black">
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(filterDepartment !== "전체" || filterStatus !== "전체" || searchTerm !== "") && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterDepartment("전체");
                  setFilterStatus("전체");
                }}
                className="h-12 w-12 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Dialog open={isGuestModalOpen} onOpenChange={setIsGuestModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-black rounded-xl h-12 px-6 font-bold flex items-center gap-2 shadow-sm">
                <Users className="w-4 h-4" />
                게스트 등록
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-100 text-black max-w-lg rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">신규 게스트 등록</DialogTitle>
                <DialogDescription className="text-gray-400">
                  방문객 정보를 입력해주세요. 등록 후 게스트 관리 페이지로 이동합니다.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveGuest} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guest-name">이름</Label>
                    <Input id="guest-name" name="name" required placeholder="성함 입력" className="bg-gray-50 border-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-company">소속사</Label>
                    <Input id="guest-company" name="company" required placeholder="회사명 입력" className="bg-gray-50 border-gray-100" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guest-host">담당자</Label>
                    <Input id="guest-host" name="host" required placeholder="담당 직원 이름" className="bg-gray-50 border-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-date">방문날짜</Label>
                    <Input id="guest-date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="bg-gray-50 border-gray-100" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-details">세부사항</Label>
                  <Input id="guest-details" name="details" placeholder="방문 목적 (예: 회의, 결재 등)" className="bg-gray-50 border-gray-100" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guest-entry">출입시간</Label>
                    <Input id="guest-entry" name="entryTime" type="time" className="bg-gray-50 border-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-exit">퇴장시간</Label>
                    <Input id="guest-exit" name="exitTime" type="time" className="bg-gray-50 border-gray-100" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-status">상태</Label>
                  <Select name="status" defaultValue="대기">
                    <SelectTrigger className="bg-gray-50 border-gray-100">
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-100 text-black">
                      <SelectItem value="대기">대기</SelectItem>
                      <SelectItem value="방문중">방문중</SelectItem>
                      <SelectItem value="방문완료">방문완료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsGuestModalOpen(false)} className="text-gray-400">취소</Button>
                  <Button type="submit" className="bg-black text-white hover:bg-black/90">등록 완료</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-black/90 rounded-xl h-12 px-6 font-bold flex items-center gap-2 shadow-md">
                <UserPlus className="w-4 h-4" />
                직원 등록
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-100 text-black max-w-lg rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">신규 직원 등록</DialogTitle>
                <DialogDescription className="text-gray-400">
                  필수 항목(사번, 이름, 부서, 직급)을 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveEmployee} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input id="name" name="name" required className="bg-gray-50 border-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">사번</Label>
                    <Input id="employeeId" name="employeeId" required className="bg-gray-50 border-gray-100" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">부서</Label>
                    <Input id="department" name="department" required className="bg-gray-50 border-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">직급</Label>
                    <Input id="position" name="position" required className="bg-gray-50 border-gray-100" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">연락처</Label>
                  <Input id="contact" name="contact" placeholder="010-0000-0000" className="bg-gray-50 border-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rfidUid">사원증 RFID UID</Label>
                  <Input id="rfidUid" name="rfidUid" placeholder="카드 태그 시 자동 입력" className="bg-gray-50 border-gray-100" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">성별</Label>
                    <Select name="gender" defaultValue="남">
                      <SelectTrigger className="bg-gray-50 border-gray-100">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-100 text-black">
                        <SelectItem value="남">남성</SelectItem>
                        <SelectItem value="여">여성</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">상태</Label>
                    <Select name="status" defaultValue="재직">
                      <SelectTrigger className="bg-gray-50 border-gray-100">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-100 text-black">
                        <SelectItem value="재직">재직</SelectItem>
                        <SelectItem value="휴직">휴직</SelectItem>
                        <SelectItem value="퇴사">퇴사</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="text-gray-400">취소</Button>
                  <Button type="submit" className="bg-black text-white hover:bg-black/90">등록 완료</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-5">직원 정보</th>
                <th className="px-6 py-5">부서/직급</th>
                <th className="px-6 py-5">연락처</th>
                <th className="px-6 py-5">누적 근무</th>
                <th className="px-6 py-5">예상 급여</th>
                <th className="px-6 py-5">상태</th>
                <th className="px-6 py-5 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-black font-bold">{emp.name}</span>
                      <span className="text-gray-400 text-xs">ID: {emp.employeeId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-700 font-medium">{emp.department}</span>
                      <span className="text-gray-400 text-xs">{emp.position}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {emp.contact}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-black font-medium">{emp.workHours}h</span>
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#9d8df1]" 
                          style={{ width: `${Math.min((emp.workHours / 160) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-black font-bold">
                    ₩{(emp.expectedSalary / 10000).toLocaleString()}만
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={cn(
                      "border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      emp.status === "재직" ? "bg-green-500/10 text-green-600" : 
                      emp.status === "휴직" ? "bg-orange-500/10 text-orange-600" : 
                      "bg-red-500/10 text-red-600"
                    )}>
                      {emp.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
                        onClick={() => setEditingEmployee(emp)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => handleDelete(emp.id, emp.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-sm text-gray-500">
            전체 <span className="font-bold text-black">{filteredEmployees.length}</span>명 중 {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)} 표시
          </p>
          <div className="flex items-center gap-1">
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
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                // Showing up to 10 pages for simplicity as requested, or logic for more
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "w-10 h-10 rounded-xl font-bold",
                      currentPage === pageNum ? "bg-black text-white" : "text-gray-400 hover:text-black hover:bg-gray-100"
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPages > 10 && <span className="text-gray-400 px-2">...</span>}
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
      )}

      {/* Edit Modal */}
      <Dialog open={!!editingEmployee} onOpenChange={(open) => !open && setEditingEmployee(null)}>
        <DialogContent className="bg-white border-gray-100 text-black max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">직원 정보 수정</DialogTitle>
            <DialogDescription className="text-gray-400">
              부서, 직급, 연락처 등을 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {editingEmployee && (
            <form onSubmit={handleSaveEmployee} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">이름</Label>
                  <Input id="edit-name" name="name" defaultValue={editingEmployee.name} required className="bg-gray-50 border-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-id">사번</Label>
                  <Input id="edit-id" name="employeeId" defaultValue={editingEmployee.employeeId} required className="bg-gray-50 border-gray-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-dept">부서</Label>
                  <Input id="edit-dept" name="department" defaultValue={editingEmployee.department} required className="bg-gray-50 border-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-pos">직급</Label>
                  <Input id="edit-pos" name="position" defaultValue={editingEmployee.position} required className="bg-gray-50 border-gray-100" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact">연락처</Label>
                <Input id="edit-contact" name="contact" defaultValue={editingEmployee.contact} className="bg-gray-50 border-gray-100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rfid">사원증 RFID UID</Label>
                <Input id="edit-rfid" name="rfidUid" defaultValue={editingEmployee.rfidUid} className="bg-gray-50 border-gray-100" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-work">누적 근무 시간</Label>
                  <Input id="edit-work" name="workHours" type="number" defaultValue={editingEmployee.workHours} className="bg-gray-50 border-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-salary">예상 급여</Label>
                  <Input id="edit-salary" name="expectedSalary" type="number" defaultValue={editingEmployee.expectedSalary} className="bg-gray-50 border-gray-100" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">재직 상태</Label>
                <Select name="status" defaultValue={editingEmployee.status}>
                  <SelectTrigger className="bg-gray-50 border-gray-100">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-100 text-black">
                    <SelectItem value="재직">재직</SelectItem>
                    <SelectItem value="휴직">휴직</SelectItem>
                    <SelectItem value="퇴사">퇴사</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setEditingEmployee(null)} className="text-gray-400">취소</Button>
                <Button type="submit" className="bg-black text-white hover:bg-black/90">수정 완료</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
