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
  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">통합 관제 대시보드</h1>
        <p className="text-gray-500 text-lg font-medium">스마트 오피스의 실시간 현황을 모니터링합니다</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="현재 건물 내 인원" 
          value="542" 
          trend="+12" 
          trendType="up"
        />
        <StatCard 
          icon={Zap} 
          label="오늘의 전력 사용량" 
          value="1,240" 
          subValue="kWh"
          trend="-5%" 
          trendType="down"
        />
        <StatCard 
          icon={DoorOpen} 
          label="회의실 가동률" 
          value="60" 
          subValue="%"
          trend="+8%" 
          trendType="up"
        />
        <StatCard 
          icon={Monitor} 
          label="활성 워크스테이션" 
          value="328" 
          subValue="/ 450"
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
          <h3 className="text-xl font-bold text-gray-900">환경 모니터링</h3>
          <div className="space-y-6">
            <EnvItem icon={Thermometer} label="온도" value="24.5" unit="°C" status="쾌적" color="text-orange-500" bg="bg-orange-50" />
            <EnvItem icon={Droplets} label="습도" value="45" unit="%" status="적정" color="text-blue-500" bg="bg-blue-50" />
            <EnvItem icon={Wind} label="CO2 농도" value="650" unit="ppm" status="좋음" color="text-green-500" bg="bg-green-50" />
          </div>
          <div className="pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-400 leading-relaxed">
              * 공조 시스템이 자동으로 최적의 업무 환경을 유지하고 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Energy Usage */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8">주간 에너지 소비</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }}
                />
                <Bar dataKey="usage" radius={[6, 6, 0, 0]}>
                  {energyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? "#000000" : "#e5e7eb"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meeting Room Occupancy */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4 w-full text-left">회의실 현황</h3>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={meetingRoomData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {meetingRoomData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-2xl font-bold text-gray-900">12/20</span>
              <p className="text-[10px] text-gray-400 font-bold uppercase">사용 중</p>
            </div>
          </div>
          <div className="w-full space-y-3 mt-4">
            {meetingRoomData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.value}개</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Access Logs */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">최근 출입 기록</h3>
            <button 
              onClick={() => onTabChange("출입 기록 관리")}
              className="text-xs font-bold text-gray-400 hover:text-black transition-colors"
            >
              전체보기
            </button>
          </div>
          <div className="space-y-4">
            {accessLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{log.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{log.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-900">{log.time}</p>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    log.type === "입장" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                  )}>
                    {log.type}
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
