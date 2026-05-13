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

interface BuildingManagementProps {
  locks: {
    temp: boolean;
    hum: boolean;
    light: boolean;
  };
  setLocks: (val: any) => void;
  settings: {
    targetTemp: number;
    targetHumidity: number;
    isLightOn: boolean;
    brightness: number;
  };
  setSettings: (val: any) => void;
  setHasUnsavedChanges: (val: boolean) => void;
}

export function BuildingManagement({ locks, setLocks, settings, setSettings, setHasUnsavedChanges }: BuildingManagementProps) {
  const [selectedArea, setSelectedArea] = useState("본관 전체");
  const [sensors, setSensors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSensors = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/dashboard/sensors/current");
      const result = await res.json();
      if (result.code === "success") {
        setSensors(result.data);
        // Default to first zone if current selectedArea is not in list
        if (result.data.length > 0 && !result.data.find((s: any) => s.zoneName === selectedArea)) {
          setSelectedArea(result.data[0].zoneName);
        }
      }
    } catch (error) {
      console.error("Failed to fetch sensors:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedArea]);

  useEffect(() => {
    fetchSensors();
  }, []);

  const currentSensor = sensors.find(s => s.zoneName === selectedArea) || sensors[0];
  const { targetTemp, targetHumidity, isLightOn, brightness } = settings;

  const setTargetTemp = (val: number) => {
    setSettings((prev: any) => ({ ...prev, targetTemp: val }));
    setHasUnsavedChanges(true);
  };

  const setTargetHumidity = (val: number) => {
    setSettings((prev: any) => ({ ...prev, targetHumidity: val }));
    setHasUnsavedChanges(true);
  };

  const setIsLightOn = (val: boolean) => {
    setSettings((prev: any) => ({ ...prev, isLightOn: val }));
    setHasUnsavedChanges(true);
  };

  const setBrightness = (val: number) => {
    setSettings((prev: any) => ({ ...prev, brightness: val }));
    setHasUnsavedChanges(true);
  };

  // Lock confirmation state
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [pendingLock, setPendingLock] = useState<{ key: keyof typeof locks, value: boolean } | null>(null);

  const confirmLockToggle = () => {
    if (pendingLock) {
      setLocks(prev => ({ ...prev, [pendingLock.key]: pendingLock.value }));
      setHasUnsavedChanges(true);
      toast.success(`${pendingLock.value ? '관리자 모드가 활성화되었습니다.' : '관리자 모드가 해제되었습니다.'}`);
    }
    setShowLockConfirm(false);
    setPendingLock(null);
  };

  const handleLockToggleRequest = (key: keyof typeof locks, value: boolean) => {
    setPendingLock({ key, value });
    setShowLockConfirm(true);
  };

  // Sync current values when area changes
  const currentTemp = currentSensor?.temp || 20;
  const currentHum = currentSensor?.humi || 40;

  const tempHistory = useMemo(() => generateHistoryData(24, currentTemp - 1.5, currentTemp + 1.5), [selectedArea, currentTemp]);
  const humidityHistory = useMemo(() => generateHistoryData(24, currentHum - 4, currentHum + 4), [selectedArea, currentHum]);

  const handleSaveAll = () => {
    toast.success("건물 전체 설정이 중앙 제어실에 저장되었습니다.");
  };

  const handleRefreshAll = () => {
    fetchSensors().then(() => {
      toast.success("데이터 동기화 완료");
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">시스템 제어 센터</h1>
        </div>

        {/* Lock Confirmation Modal */}
        <AnimatePresence>
          {showLockConfirm && (
            <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl space-y-8 text-center"
              >
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">관리자 모드 상태를<br />변경하시겠습니까?</h2>
                  <p className="text-gray-500 font-medium font-sans">관리자 모드 활성 시 일반 사용자의 설정이 제한됩니다</p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => { setShowLockConfirm(false); setPendingLock(null); }}
                    className="flex-1 h-14 rounded-2xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                  >
                    취소
                  </Button>
                  <Button 
                    onClick={confirmLockToggle}
                    className="flex-1 h-14 rounded-2xl font-bold bg-black text-white hover:bg-black/90"
                  >
                    변경하기
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-[200px] border-none bg-transparent focus:ring-0 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100 rounded-xl">
                {sensors.map(s => (
                  <SelectItem key={s.zoneId} value={s.zoneName}>{s.zoneName}</SelectItem>
                ))}
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
          color="#f97316" 
          icon={Thermometer}
          currentValue={currentTemp}
          targetValue={targetTemp}
          onTargetChange={setTargetTemp}
          isAdminLocked={locks.temp}
          onLockToggle={(v) => handleLockToggleRequest('temp', v)}
          yDomain={[18, 30]}
          yTicks={[18, 20, 22, 24, 26, 28, 30]}
        />

        <ChartSection 
          title="습도 모니터링" 
          unit="%" 
          data={humidityHistory} 
          color="#06b6d4" 
          icon={Droplets}
          currentValue={currentHum}
          targetValue={targetHumidity}
          onTargetChange={setTargetHumidity}
          isAdminLocked={locks.hum}
          onLockToggle={(v) => handleLockToggleRequest('hum', v)}
          yDomain={[20, 70]}
          yTicks={[20, 30, 40, 50, 60, 70]}
        />

        {/* Lighting control expanded to be more prominent */}
        <div className={cn(
          "bg-white text-gray-900 p-10 rounded-[50px] shadow-sm border border-gray-100 relative overflow-hidden transition-all duration-500",
          locks.light && "opacity-90 grayscale-[0.3]"
        )}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                <Lightbulb className={cn("w-7 h-7 transition-all duration-500", isLightOn ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]" : "text-gray-300")} />
              </div>
              <div>
                <h3 className="text-2xl font-black">시스템 조명 설정</h3>
                <p className="text-sm text-gray-400 font-medium">영역 내 모든 광원을 일괄 제어합니다</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                <ShieldAlert className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">관리자 모드</span>
                <Switch 
                  checked={locks.light} 
                  onCheckedChange={(v) => handleLockToggleRequest('light', v)}
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
            
            <div className="p-6 bg-yellow-50/50 rounded-3xl border border-yellow-100">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <Zap className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-yellow-900">에너지 효율 경고</p>
                  <p className="text-[11px] text-yellow-700/70 leading-relaxed mt-1">
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
  yDomain?: [number, number];
  yTicks?: number[];
}

function ChartSection({ 
  title, unit, data, color, icon: Icon, 
  currentValue, targetValue, onTargetChange, 
  isAdminLocked, onLockToggle,
  yDomain, yTicks
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
        <div className="md:col-span-9 h-[240px] w-full bg-white p-5 rounded-[30px] border border-gray-100 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 15, right: 10, left: 20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '700' }} 
                dy={10}
                interval={3}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }} 
                domain={yDomain || ['dataMin - 2', 'dataMax + 2']} 
                ticks={yTicks}
                width={55}
                dx={-10}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  backgroundColor: 'white'
                }}
                labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                itemStyle={{ padding: '0px' }}
                formatter={(value: any) => [`${value}${unit}`, title.split(' ')[0]]}
              />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={4} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="md:col-span-3 flex flex-col gap-3">
          <div className="flex-1 p-4 bg-gray-50/50 text-gray-900 border border-gray-100 rounded-[28px] flex flex-col justify-center items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">현재 상태</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-black font-mono tracking-tighter">{currentValue}</span>
              <span className="text-xs font-bold text-gray-400">{unit}</span>
            </div>
          </div>

          <div className={cn(
            "flex-1 p-5 bg-white rounded-[28px] border border-gray-100 flex flex-col justify-between shadow-sm transition-all",
            isAdminLocked && "opacity-20 pointer-events-none scale-95"
          )}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">목표 설정</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-black font-mono text-indigo-600">{localValue}</span>
                <span className="text-[9px] font-bold text-indigo-300">{unit}</span>
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
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">밝기 단계</span>
          <h4 className="text-3xl font-black font-mono text-gray-900">{localValue}%</h4>
        </div>
        <Sliders className="w-5 h-5 text-gray-400" />
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

