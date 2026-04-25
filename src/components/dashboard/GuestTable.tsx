import React, { useState, useMemo } from "react";
import { Search, X, ChevronDown, Users, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Guest } from "../../App";

interface GuestTableProps {
  guests: Guest[];
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
}

const ITEMS_PER_PAGE = 10;

export function GuestTable({ guests, setGuests }: GuestTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const filteredGuests = useMemo(() => {
    return guests.filter(g => 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.host.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [guests, searchTerm]);

  const totalPages = Math.max(Math.ceil(filteredGuests.length / ITEMS_PER_PAGE), 10);
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = (id: string, name: string) => {
    setGuests(prev => prev.filter(g => g.id !== id));
    toast.success(`${name} 게스트 정보가 완전히 삭제되었습니다.`);
  };

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingGuest) return;

    const formData = new FormData(e.currentTarget);
    const updatedGuest: Guest = {
      ...editingGuest,
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      host: formData.get("host") as string,
      details: formData.get("details") as string,
      status: formData.get("status") as any,
      entryTime: formData.get("entryTime") as string || "--:--",
      exitTime: formData.get("exitTime") as string || "-",
      date: formData.get("date") as string,
    };

    setGuests(prev => prev.map(g => g.id === editingGuest.id ? updatedGuest : g));
    toast.success("게스트 정보가 수정되었습니다.");
    setEditingGuest(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            placeholder="게스트 이름, 소속사, 담당자 검색" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 bg-white border-gray-100 text-black h-12 rounded-2xl focus-visible:ring-black/5 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-5">게스트 정보</th>
                <th className="px-6 py-5">소속사</th>
                <th className="px-6 py-5">담당자</th>
                <th className="px-6 py-5">세부사항</th>
                <th className="px-6 py-5">출입/퇴장 시간</th>
                <th className="px-6 py-5">방문날짜</th>
                <th className="px-6 py-5">상태</th>
                <th className="px-6 py-5 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-black font-bold">{guest.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700 font-medium">{guest.company}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700 font-medium">{guest.host}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {guest.details}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">{guest.entryTime}</span>
                      <span className="text-gray-300">|</span>
                      <span className="font-medium">{guest.exitTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {guest.date}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={cn(
                      "border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      guest.status === "방문중" ? "bg-green-500/10 text-green-600" : 
                      guest.status === "대기" ? "bg-orange-500/10 text-orange-600" : 
                      "bg-blue-500/10 text-blue-600"
                    )}>
                      {guest.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
                        onClick={() => setEditingGuest(guest)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => handleDelete(guest.id, guest.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {/* Fill empty rows for visual consistency if needed, but pagination handles it */}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 py-4">
        <p className="text-sm text-gray-500">
          전체 <span className="font-bold text-black">{filteredGuests.length}</span>명 중 {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredGuests.length)} 표시
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

      {/* Edit Modal */}
      <Dialog open={!!editingGuest} onOpenChange={(open) => !open && setEditingGuest(null)}>
        <DialogContent className="bg-white border-gray-100 text-black max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">게스트 정보 수정</DialogTitle>
            <DialogDescription className="text-gray-400">
              방문객의 상세 정보를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {editingGuest && (
            <form onSubmit={handleSaveEdit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-guest-name">이름</Label>
                  <Input id="edit-guest-name" name="name" defaultValue={editingGuest.name} required className="bg-gray-50 border-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-guest-company">소속사</Label>
                  <Input id="edit-guest-company" name="company" defaultValue={editingGuest.company} required className="bg-gray-50 border-gray-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-guest-host">담당자</Label>
                  <Input id="edit-guest-host" name="host" defaultValue={editingGuest.host} required className="bg-gray-50 border-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-guest-date">방문날짜</Label>
                  <Input id="edit-guest-date" name="date" defaultValue={editingGuest.date} className="bg-gray-50 border-gray-100" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-guest-details">세부사항</Label>
                <Input id="edit-guest-details" name="details" defaultValue={editingGuest.details} className="bg-gray-50 border-gray-100" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-guest-entry">출입시간</Label>
                  <Input id="edit-guest-entry" name="entryTime" defaultValue={editingGuest.entryTime} className="bg-gray-50 border-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-guest-exit">퇴장시간</Label>
                  <Input id="edit-guest-exit" name="exitTime" defaultValue={editingGuest.exitTime} className="bg-gray-50 border-gray-100" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-guest-status">상태</Label>
                <Select name="status" defaultValue={editingGuest.status}>
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
                <Button type="button" variant="ghost" onClick={() => setEditingGuest(null)} className="text-gray-400">취소</Button>
                <Button type="submit" className="bg-black text-white hover:bg-black/90">수정 완료</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
