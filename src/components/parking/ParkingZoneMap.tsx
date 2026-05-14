// 주차장 평면도 — 좌표(positionX/Y) 기반 렌더, 좌표 부재 시 grid fallback.
// useParkingZoneMap(zoneId) hook 연결. zoneId 미지정 시 안내.
import { Car, Info } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

import { useParkingZoneMap } from "@/src/features/parking/hooks";
import type { ParkingSpotMapResponse } from "@/src/features/parking/types";

interface Props {
  zoneId: number | undefined;
}

export function ParkingZoneMap({ zoneId }: Props) {
  const mapQuery = useParkingZoneMap(zoneId);

  if (zoneId === undefined) {
    return (
      <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm text-center text-sm text-gray-400">
        구역을 선택하면 평면도가 표시됩니다.
      </div>
    );
  }

  if (mapQuery.isLoading) {
    return (
      <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm text-center text-sm text-gray-400">
        평면도 불러오는 중...
      </div>
    );
  }

  if (mapQuery.isError || !mapQuery.data) {
    return (
      <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm text-center text-sm text-red-500">
        평면도 조회 중 오류가 발생했습니다.
      </div>
    );
  }

  const { zoneName, spots } = mapQuery.data;

  if (spots.length === 0) {
    return (
      <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm text-center text-sm text-gray-400">
        해당 구역에 등록된 주차면이 없습니다.
      </div>
    );
  }

  const hasCoords = spots.every((s) => s.positionX !== null && s.positionY !== null);

  return (
    <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
            <Car className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight">{zoneName} 평면도</h3>
            {!hasCoords && (
              <p className="text-xs text-gray-400 font-medium mt-1">
                좌표 미설정 — grid 형식으로 표시
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border border-gray-200 rounded-sm" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">빈자리</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-black rounded-sm" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">사용중</span>
          </div>
        </div>
      </div>

      <div className="p-1 w-full bg-gray-50/50 rounded-[40px] border border-gray-100/50 overflow-hidden">
        <div className="p-8 md:p-12 overflow-x-auto">
          {hasCoords ? <CoordsMap spots={spots} /> : <GridMap spots={spots} />}
        </div>
      </div>

      <div className="flex items-center gap-3 p-6 bg-indigo-50/30 rounded-[30px] border border-indigo-100/30">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm">
          <Info className="w-5 h-5 text-indigo-500" />
        </div>
        <p className="text-xs text-indigo-900/60 font-medium leading-relaxed">
          IoT 초음파 센서가 점유 상태 변화를 보고합니다. 센서 데이터는{" "}
          <span className="text-indigo-600 font-bold">5초마다</span> 갱신됩니다.
        </p>
      </div>
    </div>
  );
}

function GridMap({ spots }: { spots: ParkingSpotMapResponse[] }) {
  return (
    <div className="inline-grid grid-cols-8 gap-4 min-w-[800px] w-full">
      {spots.map((spot) => (
        <SpotTile key={spot.spotId} spot={spot} />
      ))}
    </div>
  );
}

function CoordsMap({ spots }: { spots: ParkingSpotMapResponse[] }) {
  const xs = spots.map((s) => s.positionX ?? 0);
  const ys = spots.map((s) => s.positionY ?? 0);
  const maxX = Math.max(...xs, 100);
  const maxY = Math.max(...ys, 100);
  // 그리드 1단위 = 50px 가정. 너비/높이 결정.
  const tile = 60;
  return (
    <div
      className="relative inline-block min-w-[800px]"
      style={{ width: `${maxX + tile}px`, height: `${maxY + tile}px` }}
    >
      {spots.map((spot) => (
        <div
          key={spot.spotId}
          className="absolute"
          style={{
            left: `${spot.positionX ?? 0}px`,
            top: `${spot.positionY ?? 0}px`,
            width: `${tile}px`,
            height: `${tile * 1.3}px`,
          }}
        >
          <SpotTile spot={spot} />
        </div>
      ))}
    </div>
  );
}

function SpotTile({ spot }: { spot: ParkingSpotMapResponse }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        "h-full aspect-[3/4] rounded-2xl flex flex-col items-center justify-center shadow-sm border-2 transition-all cursor-crosshair",
        spot.occupied
          ? "bg-black border-black/5"
          : "bg-white border-white hover:border-indigo-100",
      )}
    >
      <span
        className={cn(
          "text-xs font-bold font-mono mb-1",
          spot.occupied ? "text-white/40" : "text-gray-400",
        )}
      >
        {spot.spotNumber}
      </span>
      {spot.occupied ? (
        <Car className="w-5 h-5 text-indigo-500 fill-indigo-500/20" />
      ) : (
        <div className="w-1 h-6 bg-gray-100/50 rounded-full" />
      )}
    </motion.div>
  );
}
