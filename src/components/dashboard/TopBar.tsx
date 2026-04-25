import { Search, Bell, Plus, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export function TopBar() {
  return (
    <header className="h-20 flex items-center justify-end px-8 bg-white border-b border-gray-100">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 ml-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-black hover:bg-gray-50 rounded-full relative"
            onClick={() => toast.info("새로운 알림이 없습니다.")}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
          </Button>
          
          <Avatar className="w-10 h-10 border-2 border-gray-100 cursor-pointer hover:border-gray-200 transition-all">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
            <AvatarFallback>AX</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
