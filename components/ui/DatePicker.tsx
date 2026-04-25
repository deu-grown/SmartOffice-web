import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import * as Popover from "@radix-ui/react-popover";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface DatePickerProps {
  date: string; // ISO string or yyyy-MM-dd
  onChange: (date: string) => void;
  label?: string;
}

export function DatePicker({ date, onChange, label }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedDate = date ? parseISO(date) : new Date();

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-bold text-gray-400 ml-1">{label}</label>}
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <button
            className={cn(
              "w-full bg-gray-50 border border-gray-100 rounded-xl h-12 pl-11 pr-4 font-bold text-sm text-left flex items-center transition-all hover:bg-gray-100/50 hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 relative group",
              !date && "text-gray-400"
            )}
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <CalendarIcon className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
            </div>
            {date ? format(selectedDate, "yyyy년 MM월 dd일", { locale: ko }) : <span>날짜 선택</span>}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-[100] w-auto bg-white p-4 rounded-[32px] border border-gray-100 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            align="start"
            sideOffset={8}
          >
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(d) => {
                if (d) {
                  onChange(format(d, "yyyy-MM-dd"));
                  setIsOpen(false);
                }
              }}
              locale={ko}
              className="p-3"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                month_caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-sm font-bold text-gray-900",
                nav: "space-x-1 flex items-center",
                button_previous: cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-lg absolute left-1"
                ),
                button_next: cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-lg absolute right-1"
                ),
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex",
                weekday: "text-gray-400 rounded-md w-9 font-bold text-[10px] uppercase text-center",
                week: "flex w-full mt-2",
                day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day_button: cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-9 w-9 p-0 font-bold aria-selected:opacity-100 rounded-xl transition-all"
                ),
                selected:
                  "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white shadow-lg forced-color-adjust-none",
                today: "bg-gray-100 text-black",
                outside:
                  "day-outside text-gray-300 opacity-50 aria-selected:bg-gray-100/50 aria-selected:text-gray-300 aria-selected:opacity-30",
                disabled: "text-gray-300 opacity-50",
                range_middle:
                  "aria-selected:bg-gray-100 aria-selected:text-gray-900",
                hidden: "invisible",
              }}
              components={{
                Chevron: ({ orientation }) => {
                  if (orientation === "left") return <ChevronLeft className="h-4 w-4" />;
                  if (orientation === "right") return <ChevronRight className="h-4 w-4" />;
                  return null;
                },
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
