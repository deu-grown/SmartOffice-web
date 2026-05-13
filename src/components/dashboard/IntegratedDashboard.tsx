import React from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  Users, 
  Zap, 
  Thermometer, 
  Droplets, 
  Wind, 
  DoorOpen, 
  Monitor,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { motion } from "motion/react";

const occupancyData = [
  { time: "08:00", count: 120 },
  { time: "10:00", count: 450 },
  { time: "12:00", count: 380 },
  { time: "14:00", count: 520 },
  { time: "16:00", count: 480 },
  { time: "18:00", count: 210 },
  { time: "20:00", count: 80 },
];

const zoneEnvData: Record<string, { temp: string; humidity: string; co2: string; status: { temp: string; humidity: string; co2: string } }> = {
  "본관 전체": { temp: "24.5", humidity: "45", co2: "650", status: { temp: "쾌적", humidity: "적정", co2: "좋음" } },
  "개발본부": { temp: "23.8", humidity: "42", co2: "710", status: { temp: "쾌적", humidity: "적정", co2: "보통" } },
  "연구동": { temp: "22.5", humidity: "48", co2: "580", status: { temp: "쾌적", humidity: "적정", co2: "좋음" } },
  "데이터센터": { temp: "19.0", humidity: "35", co2: "420", status: { temp: "안정", humidity: "건조", co2: "좋음" } },
};

const energyData = [
  { day: "월", usage: 450 },
  { day: "화", usage: 520 },
  { day: "수", usage: 480 },
  { day: "목", usage: 610 },
  { day: "금", usage: 550 },
  { day: "토", usage: 120 },
  { day: "일", usage: 90 },
];

const meetingRoomData = [
  { name: "사용 중", value: 12, color: "#000000" },
  { name: "비어 있음", value: 8, color: "#f3f4f6" },
];

const accessLogs = [
  { id: 1, name: "김철수", time: "14:25:01", location: "본관 1F 로비", type: "입장" },
  { id: 2, name: "이영희", time: "14:22:15", location: "연구동 3F", type: "입장" },
  { id: 3, name: "박민수", time: "14:18:42", location: "본관 4F 회의실", type: "퇴장" },
  { id: 4, name: "최지우", time: "14:15:10", location: "지하주차장 B1", type: "입장" },
  { id: 5, name: "정다은", time: "14:10:55", location: "본관 2F 사무실", type: "입장" },
];

export function IntegratedDashboard({ onTabChange }: { onTabChange: (tab: any) => void }) {
  const [selectedZone, setSelectedZone] = React.useState("본관 전체");
  const [summaryData, setSummaryData] = React.useState<any>(null);
  const [accessRecords, setAccessRecords] = React.useState<any[]>([]);
  const [attendance, setAttendance] = React.useState<any>(null);
  const [sensors, setSensors] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        const [sumRes, accRes, attRes, senRes] = await Promise.all([
          fetch("/api/v1/dashboard/summary"),
          fetch("/api/v1/dashboard/access/recent?limit=5"),
          fetch("/api/v1/dashboard/attendance/today"),
          fetch("/api/v1/dashboard/sensors/current")
        ]);

        const [sum, acc, att, sen] = await Promise.all([
          sumRes.json(),
          accRes.json(),
          attRes.json(),
          senRes.json()
        ]);

        if (sum.code === "success") setSummaryData(sum.data);
        if (acc.code === "success") setAccessRecords(acc.data);
        if (att.code === "success") setAttendance(att.data);
        if (sen.code === "success") setSensors(sen.data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Map sensor data to zoneEnvData structure
  const currentSensor = sensors.find(s => s.zoneName === selectedZone) || sensors[0];
  
  const getStatus = (val: number, type: 'temp' | 'humi' | 'co2') => {
    if (type === 'temp') return val > 26 ? "더움" : val < 20 ? "추움" : "쾌적";
    if (type === 'humi') return val > 60 ? "습함" : val < 30 ? "건조" : "적정";
    if (type === 'co2') return val > 1000 ? "나쁨" : val > 700 ? "보통" : "좋음";
    return "-";
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">통합 관제 대시보드</h1>
        <p className="text-gray-500 text-lg font-medium">스마트 오피스의 실시간 현황을 모니터링합니다</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="현재 출근 인원" 
          value={attendance?.presentCount?.toLocaleString() || "0"} 
          subValue={`/ ${attendance?.totalExpected || "0"}`}
          trend={attendance?.lateCount > 0 ? `지각 ${attendance.lateCount}` : null} 
          trendType="down"
        />
        <StatCard 
          icon={DoorOpen} 
          label="오늘의 예약" 
          value={summaryData?.todayReservations?.toLocaleString() || "0"} 
          trend={summaryData?.pendingApprovals > 0 ? `${summaryData.pendingApprovals}건 대기` : null}
          trendType="up"
        />
        <StatCard 
          icon={Zap} 
          label="활성 장치" 
          value={summaryData?.activeDevices?.toLocaleString() || "0"} 
          trendType="up"
        />
        <StatCard 
          icon={Monitor} 
          label="전체 사용자" 
          value={summaryData?.totalUsers?.toLocaleString() || "0"} 
          trendType="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">시간대별 인원 현황</h3>
              <p className="text-sm text-gray-500">실시간 유동 인원 데이터</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-black rounded-full" />
              <span className="text-xs font-bold text-gray-900">인원 수</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#000000" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Environmental Status */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">환경 모니터링</h3>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-[140px] h-9 bg-gray-50 border-gray-100 rounded-xl text-xs font-bold">
                <SelectValue placeholder="구역 선택" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100">
                {sensors.map(s => (
                  <SelectItem key={s.zoneId} value={s.zoneName}>{s.zoneName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-6">
            {currentSensor ? (
              <>
                <EnvItem icon={Thermometer} label="온도" value={currentSensor.temp} unit="°C" status={getStatus(currentSensor.temp, 'temp')} color="text-orange-500" bg="bg-orange-50" />
                <EnvItem icon={Droplets} label="습도" value={currentSensor.humi} unit="%" status={getStatus(currentSensor.humi, 'humi')} color="text-blue-500" bg="bg-blue-50" />
                <EnvItem icon={Wind} label="CO2 농도" value={currentSensor.co2} unit="ppm" status={getStatus(currentSensor.co2, 'co2')} color="text-green-500" bg="bg-green-50" />
              </>
            ) : (
              <p className="text-center text-gray-400 py-12">데이터를 불러오는 중...</p>
            )}
          </div>
          <div className="pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-400 leading-relaxed">
              * 센서 데이터 업데이트: {currentSensor?.updatedAt ? new Date(currentSensor.updatedAt).toLocaleTimeString() : "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4 w-full text-left">근태 현황</h3>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "출근", value: attendance?.presentCount || 0, color: "#000000" },
                    { name: "미출근", value: attendance?.absentCount || 0, color: "#e5e7eb" },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: "출근", color: "#000000" },
                    { name: "미출근", color: "#e5e7eb" },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-2xl font-bold text-gray-900">{attendance?.presentCount || 0}/{attendance?.totalExpected || 0}</span>
              <p className="text-[10px] text-gray-400 font-bold uppercase">출근율</p>
            </div>
          </div>
          <div className="w-full space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-black" />
                <span className="text-sm font-medium text-gray-600">출근</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{attendance?.presentCount || 0}명</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-200" />
                <span className="text-sm font-medium text-gray-600">결근</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{attendance?.absentCount || 0}명</span>
            </div>
          </div>
        </div>

        {/* Weekly Access Logs (Simplified for Demo) */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">최근 출입 기록</h3>
            <button 
              onClick={() => onTabChange("출입 기록 관리")}
              className="text-xs font-bold text-gray-400 hover:text-black transition-colors"
            >
              전체보기
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accessRecords.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">
                    👤
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{log.userName}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{log.zoneName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-900">{new Date(log.accessTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    log.type === "IN" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                  )}>
                    {log.type === "IN" ? "입장" : "퇴장"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subValue, trend, trendType }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between h-40"
    >
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-black" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold",
            trendType === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}>
            {trendType === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          {subValue && <span className="text-sm font-medium text-gray-400">{subValue}</span>}
        </div>
      </div>
    </motion.div>
  );
}

function EnvItem({ icon: Icon, label, value, unit, status, color, bg }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", bg)}>
          <Icon className={cn("w-6 h-6", color)} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900">{value}</span>
            <span className="text-xs font-medium text-gray-400">{unit}</span>
          </div>
        </div>
      </div>
      <Badge className={cn("border-none px-3 py-1 rounded-full text-[10px] font-bold", bg, color)}>
        {status}
      </Badge>
    </div>
  );
}

function Badge({ children, className }: any) {
  return (
    <span className={cn("inline-flex items-center justify-center", className)}>
      {children}
    </span>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
