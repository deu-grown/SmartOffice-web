import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  UserPlus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

import type { Employee } from "@/src/components/dashboard/PersonnelTable";

const ITEMS_PER_PAGE = 10;

interface PersonnelListTableProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string, name: string) => void;
  onEditEmployee: (employee: Employee) => void;
}

// PersonnelTable 의 목록/필터/페이지네이션/등록 모달/통계 카드 영역.
// C0 빈 분할 단계에서는 기존 동작을 그대로 보존한다.
export function PersonnelListTable({
  employees,
  onAddEmployee,
  onDeleteEmployee,
  onEditEmployee,
}: PersonnelListTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("전체");
  const [filterDepartment, setFilterDepartment] = useState<string>("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Stats for REQ-U-002
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "재직").length;
  const attendanceRate =
    totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0;
  const totalWorkHours = employees.reduce((acc, curr) => acc + curr.workHours, 0);
  const totalExpectedSalary = employees.reduce(
    (acc, curr) => acc + curr.expectedSalary,
    0,
  );

  const departments = useMemo(
    () => ["전체", ...Array.from(new Set(employees.map((e) => e.department)))],
    [employees],
  );
  const statuses = ["전체", "재직", "휴직", "퇴사"];

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "전체" || emp.status === filterStatus;
      const matchesDept =
        filterDepartment === "전체" || emp.department === filterDepartment;

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [employees, searchTerm, filterStatus, filterDepartment]);

  const totalPages = Math.max(Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE), 1);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // 필터 조건 변경 시 첫 페이지로 리셋.
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterDepartment]);

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEmp: Employee = {
      id: (employees.length + 1).toString(),
      name: String(formData.get("name") ?? ""),
      employeeId: String(formData.get("employeeId") ?? ""),
      department: String(formData.get("department") ?? ""),
      position: String(formData.get("position") ?? ""),
      contact: String(formData.get("contact") ?? ""),
      gender: (formData.get("gender") as "남" | "여") ?? "남",
      workHours: Number(formData.get("workHours")) || 0,
      expectedSalary: Number(formData.get("expectedSalary")) || 0,
      status: ((formData.get("status") as string) || "재직") as Employee["status"],
      permissions: ["USER"],
      rfidUid: (formData.get("rfidUid") as string) || undefined,
    };
    onAddEmployee(newEmp);
    setIsAddModalOpen(false);
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
            <span className="text-3xl font-bold text-black">
              ₩{Math.floor(totalExpectedSalary / 10000).toLocaleString()}만
            </span>
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
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-32 h-12 bg-white border-gray-100 rounded-xl shadow-sm">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100 text-black">
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(filterDepartment !== "전체" ||
              filterStatus !== "전체" ||
              searchTerm !== "") && (
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
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger
              render={
                <Button className="bg-black text-white hover:bg-black/90 rounded-xl h-12 px-6 font-bold flex items-center gap-2 shadow-md">
                  <UserPlus className="w-4 h-4" />
                  직원 등록
                </Button>
              }
            />
            <DialogContent className="bg-white border-gray-100 text-black max-w-lg rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">신규 직원 등록</DialogTitle>
                <DialogDescription className="text-gray-400">
                  필수 항목(사번, 이름, 부서, 직급)을 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input id="name" name="name" required className="bg-gray-50 border-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">사번</Label>
                    <Input
                      id="employeeId"
                      name="employeeId"
                      required
                      className="bg-gray-50 border-gray-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">부서</Label>
                    <Input
                      id="department"
                      name="department"
                      required
                      className="bg-gray-50 border-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">직급</Label>
                    <Input
                      id="position"
                      name="position"
                      required
                      className="bg-gray-50 border-gray-100"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">연락처</Label>
                  <Input
                    id="contact"
                    name="contact"
                    placeholder="010-0000-0000"
                    className="bg-gray-50 border-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rfidUid">사원증 RFID UID</Label>
                  <Input
                    id="rfidUid"
                    name="rfidUid"
                    placeholder="카드 태그 시 자동 입력"
                    className="bg-gray-50 border-gray-100"
                  />
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
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-gray-400"
                  >
                    취소
                  </Button>
                  <Button type="submit" className="bg-black text-white hover:bg-black/90">
                    등록 완료
                  </Button>
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
                  <td className="px-6 py-4 text-gray-500 text-sm">{emp.contact}</td>
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
                    ₩{Math.floor(emp.expectedSalary / 10000).toLocaleString()}만
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={cn(
                        "border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        emp.status === "재직"
                          ? "bg-green-500/10 text-green-600"
                          : emp.status === "휴직"
                            ? "bg-orange-500/10 text-orange-600"
                            : "bg-red-500/10 text-red-600",
                      )}
                    >
                      {emp.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
                        onClick={() => onEditEmployee(emp)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => onDeleteEmployee(emp.id, emp.name)}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-sm text-gray-500">
            전체 <span className="font-bold text-black">{filteredEmployees.length}</span>명 중{" "}
            {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)} 표시
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl border-gray-100 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                if (totalPages > 10) {
                  const isFirstSet = pageNum <= 3;
                  const isLastSet = pageNum > totalPages - 3;
                  const isMiddle = Math.abs(pageNum - currentPage) <= 1;

                  if (!isFirstSet && !isLastSet && !isMiddle) {
                    if (pageNum === 4 || pageNum === totalPages - 3)
                      return (
                        <span key={pageNum} className="text-gray-300 px-1">
                          ...
                        </span>
                      );
                    return null;
                  }
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "w-10 h-10 rounded-xl font-bold transition-all",
                      currentPage === pageNum
                        ? "bg-black text-white shadow-lg"
                        : "text-gray-400 hover:text-black hover:bg-gray-100",
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl border-gray-100 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
