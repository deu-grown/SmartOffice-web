import React from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import type { Employee } from "@/src/components/dashboard/PersonnelTable";

interface PersonnelDetailDrawerProps {
  employee: Employee | null;
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}

// 직원 상세/수정 드로어. C0 빈 분할 단계에서는 기존 수정 Dialog 동작을 그대로 보존한다.
// 컴포넌트 명칭은 마스터플랜 분할 가이드를 따라 Drawer 로 명명한다.
export function PersonnelDetailDrawer({
  employee,
  onClose,
  onSave,
}: PersonnelDetailDrawerProps) {
  return (
    <Dialog open={!!employee} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border-gray-100 text-black max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">직원 정보 수정</DialogTitle>
          <DialogDescription className="text-gray-400">
            부서, 직급, 연락처 등을 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        {employee && (
          <form onSubmit={onSave} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">이름</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={employee.name}
                  required
                  className="bg-gray-50 border-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-id">사번</Label>
                <Input
                  id="edit-id"
                  name="employeeId"
                  defaultValue={employee.employeeId}
                  required
                  className="bg-gray-50 border-gray-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dept">부서</Label>
                <Input
                  id="edit-dept"
                  name="department"
                  defaultValue={employee.department}
                  required
                  className="bg-gray-50 border-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pos">직급</Label>
                <Input
                  id="edit-pos"
                  name="position"
                  defaultValue={employee.position}
                  required
                  className="bg-gray-50 border-gray-100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contact">연락처</Label>
              <Input
                id="edit-contact"
                name="contact"
                defaultValue={employee.contact}
                className="bg-gray-50 border-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rfid">사원증 RFID UID</Label>
              <Input
                id="edit-rfid"
                name="rfidUid"
                defaultValue={employee.rfidUid}
                className="bg-gray-50 border-gray-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-work">누적 근무 시간</Label>
                <Input
                  id="edit-work"
                  name="workHours"
                  type="number"
                  defaultValue={employee.workHours}
                  className="bg-gray-50 border-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-salary">예상 급여</Label>
                <Input
                  id="edit-salary"
                  name="expectedSalary"
                  type="number"
                  defaultValue={employee.expectedSalary}
                  className="bg-gray-50 border-gray-100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">재직 상태</Label>
              <Select name="status" defaultValue={employee.status}>
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
              <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400">
                취소
              </Button>
              <Button type="submit" className="bg-black text-white hover:bg-black/90">
                수정 완료
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
