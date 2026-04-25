import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Thermometer, 
  Droplets, 
  Zap, 
  Sliders, 
  Power, 
  Lightbulb, 
  Save, 
  RefreshCw, 
  ShieldAlert,
  Wind,
  Info,
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";

const generateHistoryData = (points: number, min: number, max: number) => {
  return Array.from({ length: points }, (_, i) => ({
    time: `${i}:00`,
    value: Math.floor(Math.random() * (max - min + 1) + min)
  }));
};

export function BuildingManagement() {
  const [selectedArea, setSelectedArea] = useState("제 1 연구소");
  const [selectedRoom, setSelectedRoom] = useState("R101");
  
  // Per-area & per-room real-time data mapping
  const roomDataConfig: Record<string, Record<string, { temp: number, hum: number }>> = {
    "제 1 연구소": {
      "R101": { temp: 23.5, hum: 42 },
      "R102": { temp: 21.8, hum: 38 },
      "R103": { temp: 25.2, hum: 55 },
      "R201": { temp: 22.0, hum: 45 },
    },
    "제 2 연구소": {
      "R101": { temp: 19.5, hum: 30 },
      "R102": { temp: 20.2, hum: 35 },
      "R103": { temp: 18.5, hum: 32 },
      "R201": { temp: 21.0, hum: 40 },
    },
    "본관 로비": {
      "R101": { temp: 24.5, hum: 50 },
      "R102": { temp: 26.0, hum: 52 },
      "R103": { temp: 23.2, hum: 48 },
      "R201": { temp: 25.5, hum: 55 },
    }
  };

  // Individual Admin Locks
  const [locks, setLocks] = useState({
    temp: false,
    hum: false,
    light: false
  });

  const [targetTemp, setTargetTemp] = useState(24);
  const [targetHumidity, setTargetHumidity] = useState(45);
  const [isLightOn, setIsLightOn] = useState(true);
  const [brightness, setBrightness] = useState(80);

  // Sync current values when room or area changes
  const currentTemp = roomDataConfig[selectedArea]?.[selectedRoom]?.temp || 20;
  const currentHum = roomDataConfig[selectedArea]?.[selectedRoom]?.hum || 40;

  const tempHistory = useMemo(() => generateHistoryData(24, currentTemp - 1.5, currentTemp + 1.5), [selectedArea, selectedRoom, currentTemp]);
  const humidityHistory = useMemo(() => generateHistoryData(24, currentHum - 4, currentHum + 4), [selectedArea, selectedRoom, currentHum]);

  const handleSaveAll = () => {
    toast.success("건물 전체 설정이 중앙 제어실에 저장되었습니다.");
  };

  const handleRefreshAll = () => {
    toast.info("실시간 센서 데이터를 동기화 중입니다...");
    setTimeout(() => toast.success("데이터 동기화 완료"), 800);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">시스템 제어 센터</h1>
          <p className="text-gray-400 font-medium lowercase tracking-wide">building integrated management system / v2.4</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-[160px] border-none bg-transparent focus:ring-0 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100 rounded-xl">
                <SelectItem value="제 1 연구소">제 1 연구소</SelectItem>
                <SelectItem value="제 2 연구소">제 2 연구소</SelectItem>
                <SelectItem value="본관 로비">본관 로비</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-[1px] h-8 bg-gray-200 self-center mx-1" />
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="w-[100px] border-none bg-transparent focus:ring-0 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100 rounded-xl">
                <SelectItem value="R101">R101</SelectItem>
                <SelectItem value="R102">R102</SelectItem>
                <SelectItem value="R103">R103</SelectItem>
                <SelectItem value="R201">R201</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleRefreshAll} variant="outline" className="h-12 px-6 rounded-2xl border-gray-200 font-bold gap-2">
              <RefreshCw className="w-4 h-4" />
              데이터 갱신
            </Button>
            <Button onClick={handleSaveAll} className="h-12 px-8 bg-black text-white hover:bg-zinc-800 rounded-2xl font-bold gap-2 shadow-lg transition-transform active:scale-95">
              <Save className="w-4 h-4" />
              전체 저장
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartSection 
          title="온도 모니터링" 
          unit="°C" 
          data={tempHistory} 
          color="#f43f5e" 
          icon={Thermometer}
          currentValue={currentTemp}
          targetValue={targetTemp}
          onTargetChange={setTargetTemp}
          isAdminLocked={locks.temp}
          onLockToggle={(v) => setLocks(prev => ({ ...prev, temp: v }))}
        />

        <ChartSection 
          title="습도 모니터링" 
          unit="%" 
          data={humidityHistory} 
          color="#0ea5e9" 
          icon={Droplets}
          currentValue={currentHum}
          targetValue={targetHumidity}
          onTargetChange={setTargetHumidity}
          isAdminLocked={locks.hum}
          onLockToggle={(v) => setLocks(prev => ({ ...prev, hum: v }))}
        />

        {/* Lighting control expanded to be more prominent */}
        <div className={cn(
          "bg-[#0a0a0a] text-white p-10 rounded-[50px] shadow-2xl relative overflow-hidden transition-all duration-500",
          locks.light && "opacity-90 grayscale-[0.3]"
        )}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[100px] pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <Lightbulb className={cn("w-7 h-7 transition-all duration-500", isLightOn ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" : "text-zinc-600")} />
              </div>
              <div>
                <h3 className="text-2xl font-black">시스템 조명 설정</h3>
                <p className="text-sm text-zinc-500 font-medium">영역 내 모든 광원을 일괄 제어합니다</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
                <ShieldAlert className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">관리자 모드</span>
                <Switch 
                  checked={locks.light} 
                  onCheckedChange={(v) => setLocks(prev => ({ ...prev, light: v }))}
                  className="data-[state=checked]:bg-indigo-600 scale-75"
                />
              </div>
              <Switch 
                disabled={locks.light}
                checked={isLightOn} 
                onCheckedChange={setIsLightOn} 
                className="data-[state=checked]:bg-yellow-500 h-8 w-14" 
              />
            </div>
          </div>

          <div className="space-y-10 relative z-10">
            <BrightnessSlider 
              value={brightness} 
              onChange={setBrightness} 
              disabled={!isLightOn || locks.light} 
            />
            
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <Zap className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-300">에너지 효율 경고</p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">
                    현재 구역의 조도가 필요 이상으로 높게 설정되어 있습니다. 70% 이하 설정을 권장합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Summary Card or Placeholder for balance */}
        <div className="bg-zinc-50 p-10 rounded-[50px] border border-zinc-100 flex flex-col justify-center items-center text-center space-y-6">
          <div className="w-20 h-20 bg-white rounded-full shadow-inner flex items-center justify-center">
            <Settings2 className="w-8 h-8 text-indigo-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-900">스마트 환경 대시보드</h3>
            <p className="text-sm text-zinc-500 max-w-xs mt-2 font-medium">
              모든 데이터는 5분 간격으로 자동 백업되며, 중앙 로그 서버에 기록됩니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            <div className="bg-white p-4 rounded-2xl border border-zinc-100">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">상태</span>
              <span className="font-bold text-emerald-500">운영 중</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-zinc-100">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">버전</span>
              <span className="font-bold text-zinc-700">v2.4.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChartSectionProps {
  title: string;
  unit: string;
  data: any[];
  color: string;
  icon: any;
  currentValue: number;
  targetValue: number;
  onTargetChange: (val: number) => void;
  isAdminLocked: boolean;
  onLockToggle: (v: boolean) => void;
}

function ChartSection({ 
  title, unit, data, color, icon: Icon, 
  currentValue, targetValue, onTargetChange, 
  isAdminLocked, onLockToggle 
}: ChartSectionProps) {
  const [localValue, setLocalValue] = useState(targetValue);

  useEffect(() => {
    setLocalValue(targetValue);
  }, [targetValue]);

  return (
    <div className={cn(
      "bg-white p-8 rounded-[50px] border border-gray-100 shadow-sm flex flex-col gap-10 transition-all duration-300",
      isAdminLocked && "bg-gray-50/50"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          <h3 className="text-2xl font-black tracking-tight">{title}</h3>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100/50 px-4 py-2 rounded-xl">
          <ShieldAlert className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">관리자 모드</span>
          <Switch 
            checked={isAdminLocked} 
            onCheckedChange={onLockToggle}
            className="data-[state=checked]:bg-gray-900 scale-75"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 h-[240px] w-full bg-gray-50/50 p-6 rounded-[30px] border border-gray-50">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`color${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
              <RechartsTooltip 
                contentStyle={{ 
                  borderRadius: '20px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={4} fillOpacity={1} fill={`url(#color${title})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="flex-1 p-6 bg-zinc-900 text-white rounded-[30px] flex flex-col justify-center items-center shadow-xl">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">실시간 현재</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black font-mono tracking-tighter">{currentValue}</span>
              <span className="text-xs font-bold text-zinc-500">{unit}</span>
            </div>
          </div>

          <div className={cn(
            "flex-1 p-6 bg-white rounded-[30px] border border-gray-100 flex flex-col justify-between transition-all",
            isAdminLocked && "opacity-20 pointer-events-none scale-95"
          )}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">설정 변경</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-black font-mono text-indigo-600">{localValue}</span>
                <span className="text-[10px] font-bold text-indigo-400">{unit}</span>
              </div>
            </div>
            <Slider 
              value={[localValue]} 
              onValueChange={(vals) => setLocalValue(vals[0])}
              onValueCommit={(vals) => onTargetChange(vals[0])}
              max={unit === '%' ? 80 : 32} 
              min={unit === '%' ? 20 : 16} 
              step={1} 
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BrightnessSlider({ value, onChange, disabled }: { value: number, onChange: (v: number) => void, disabled: boolean }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className={cn("space-y-6 transition-all", disabled && "opacity-20 pointer-events-none")}>
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-1">인텐시티 레벨</span>
          <h4 className="text-3xl font-black font-mono">{localValue}%</h4>
        </div>
        <Sliders className="w-5 h-5 text-zinc-700" />
      </div>
      <Slider 
        value={[localValue]} 
        onValueChange={(vals) => setLocalValue(vals[0])} 
        onValueCommit={(vals) => onChange(vals[0])} 
        max={100} 
        min={0}
        step={1} 
        className="cursor-pointer"
      />
    </div>
  );
}

