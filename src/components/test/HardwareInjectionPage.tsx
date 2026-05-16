// 하드웨어 대체 데이터 주입 페이지 — 개발 전용(dev-only). import.meta.env.DEV 게이팅 적용.
// 운영 빌드에서는 App.tsx 라우트 미등록으로 이 컴포넌트가 번들에 포함되지 않는다.
import { useState } from "react";

import type { InjectionLogEntry } from "@/src/features/testInjection/types";
import { AttendanceBatchSection } from "./AttendanceBatchSection";
import { InjectionHistoryPanel } from "./InjectionHistoryPanel";
import { NfcTagSection } from "./NfcTagSection";
import { ParkingStatusSection } from "./ParkingStatusSection";
import { PowerBillingSection } from "./PowerBillingSection";
import { ReservationCheckInSection } from "./ReservationCheckInSection";
import { SensorLogSection } from "./SensorLogSection";

const MAX_HISTORY = 10;

export function HardwareInjectionPage() {
  const [history, setHistory] = useState<InjectionLogEntry[]>([]);

  const appendLog = (entry: InjectionLogEntry) => {
    setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">
          🧪 하드웨어 데이터 주입
        </h1>
        <p className="text-gray-500 text-lg font-medium">
          하드웨어 신호를 UI 버튼으로 대체 주입합니다 (개발 전용)
        </p>
      </header>

      {/* 경고 배너 */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-sm text-amber-800 font-medium">
        ⚠️ <strong>개발 전용 페이지 — 운영 빌드 비노출</strong>
        <span className="ml-2 text-amber-600 font-normal">
          이 페이지는 하드웨어가 없는 환경에서 테스트용 데이터를 직접 주입합니다.
          운영 환경(`npm run build`)에서는 이 라우트가 등록되지 않습니다.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NfcTagSection onLog={appendLog} />
        <SensorLogSection onLog={appendLog} />
        <ParkingStatusSection onLog={appendLog} />
        <AttendanceBatchSection onLog={appendLog} />
        <PowerBillingSection onLog={appendLog} />
        <ReservationCheckInSection onLog={appendLog} />
      </div>

      <InjectionHistoryPanel entries={history} onClear={() => setHistory([])} />
    </div>
  );
}
