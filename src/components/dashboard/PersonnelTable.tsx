import React, { useState } from "react";
import { toast } from "sonner";

import { DepartmentSidebar } from "@/src/components/personnel/DepartmentSidebar";
import { PersonnelListTable } from "@/src/components/personnel/PersonnelListTable";
import { PersonnelDetailDrawer } from "@/src/components/personnel/PersonnelDetailDrawer";

// 직원 도메인 타입 — C0 빈 분할 단계에서는 컨테이너에 정의 후 자식 컴포넌트가 type-only import 한다.
// C6 (features/user) 진입 시 백엔드 DTO 와 매핑되는 타입으로 교체될 예정.
export interface Employee {
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
  // 페이지네이션 검증용 24명 mock 추가 (총 30명).
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

interface PersonnelTableProps {
  onTabChange?: (tab: any) => void;
  onAddGuest?: (guest: any) => void;
}

// 인사 페이지 컨테이너. C0 빈 분할로 자식 4 컴포넌트로 책임을 분리했으며,
// 플랜 3-1 후속 커밋(C5~C8)에서 features/department · user · attendance 와 차례로 연결된다.
export function PersonnelTable(_props: PersonnelTableProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>("전체");

  const handleAddEmployee = (employee: Employee) => {
    setEmployees((prev) => [...prev, employee]);
    toast.success("신규 직원이 등록되었습니다.");
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    toast.success(`${name} 직원의 정보가 완전히 삭제되었습니다.`);
  };

  const handleSaveEdited = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEmployee) return;
    const formData = new FormData(e.currentTarget);
    const updated: Employee = {
      id: editingEmployee.id,
      name: String(formData.get("name") ?? editingEmployee.name),
      employeeId: String(formData.get("employeeId") ?? editingEmployee.employeeId),
      department: String(formData.get("department") ?? editingEmployee.department),
      position: String(formData.get("position") ?? editingEmployee.position),
      contact: String(formData.get("contact") ?? editingEmployee.contact),
      gender: editingEmployee.gender,
      workHours: Number(formData.get("workHours")) || editingEmployee.workHours,
      expectedSalary:
        Number(formData.get("expectedSalary")) || editingEmployee.expectedSalary,
      status:
        ((formData.get("status") as string) || editingEmployee.status) as Employee["status"],
      permissions: editingEmployee.permissions,
      rfidUid: (formData.get("rfidUid") as string) || editingEmployee.rfidUid,
    };
    setEmployees((prev) => prev.map((emp) => (emp.id === updated.id ? updated : emp)));
    toast.success("직원 정보가 수정되었습니다.");
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-8">
      <DepartmentSidebar
        selectedDepartment={filterDepartment}
        onSelect={setFilterDepartment}
      />
      <PersonnelListTable
        employees={employees}
        filterDepartment={filterDepartment}
        onResetDepartmentFilter={() => setFilterDepartment("전체")}
        onAddEmployee={handleAddEmployee}
        onDeleteEmployee={handleDeleteEmployee}
        onEditEmployee={setEditingEmployee}
      />
      <PersonnelDetailDrawer
        employee={editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onSave={handleSaveEdited}
      />
    </div>
  );
}
