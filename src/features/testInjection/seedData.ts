// 하드웨어 주입 페이지 드롭다운용 시드 상수 + 랜덤 헬퍼.
// Flyway V2~V8 시드 기준 고정값. 소스에 비밀번호·민감 정보를 포함하지 않는다.
import type { SensorType } from "./types";

// ─── NFC 리더기 (장치) ───────────────────────────────────────────────────────
export const SEED_NFC_READERS = [
  { deviceId: 1, label: "회의실A 출입리더기 (zone2, ACTIVE)" },
  { deviceId: 2, label: "회의실B 출입리더기 (zone4, ACTIVE)" },
  { deviceId: 5, label: "서버실 출입리더기 (zone7, ACTIVE)" },
  { deviceId: 11, label: "회의실C 출입리더기 (zone10, 고장 — 실패 케이스)" },
] as const;

// ─── NFC 카드 UID ────────────────────────────────────────────────────────────
export const SEED_NFC_CARDS = [
  { uid: "ADMIN-CARD-UID-001", label: "admin (user1) — ACTIVE", active: true },
  { uid: "EMP002-CARD-UID-001", label: "이순신 (user2) — ACTIVE", active: true },
  { uid: "EMP003-CARD-UID-001", label: "장보고 (user3) — ACTIVE", active: true },
  { uid: "EMP004-CARD-UID-001", label: "세종대왕 (user4) — ACTIVE", active: true },
  { uid: "EMP005-CARD-UID-001", label: "문화왕 (user5, 퇴사) — 거부 케이스", active: false },
  { uid: "EMP006-CARD-UID-001", label: "홍길동 (user6) — ACTIVE", active: true },
  { uid: "EMP007-CARD-UID-001", label: "신사임당 (user7) — ACTIVE", active: true },
  { uid: "EMP007-CARD-UID-002", label: "신사임당 2번째 카드 (user7) — ACTIVE", active: true },
  { uid: "EMP008-CARD-UID-001", label: "윤동주 (user8) — ACTIVE", active: true },
  { uid: "EMP009-CARD-UID-001", label: "김유신 (user9, 분실) — 거부 케이스", active: false },
  { uid: "EMP010-CARD-UID-001", label: "강감찬 (user10, 분실) — 거부 케이스", active: false },
  { uid: "EMP011-CARD-UID-001", label: "안중근 (user11, 만료) — 거부 케이스", active: false },
] as const;

// 랜덤 직원으로 주입할 때 사용하는 정상(ACTIVE) 카드 목록
export const SEED_NFC_CARDS_ACTIVE = SEED_NFC_CARDS.filter((c) => c.active);

// ─── 센서 장치 ───────────────────────────────────────────────────────────────
export interface SeedSensorDevice {
  deviceId: number;
  label: string;
  zoneId: number;
  sensorType: SensorType;
}

export const SEED_SENSOR_DEVICES: SeedSensorDevice[] = [
  { deviceId: 3, label: "개발팀 온도센서 (zone5)", zoneId: 5, sensorType: "TEMPERATURE" },
  { deviceId: 4, label: "개발팀 습도센서 (zone5)", zoneId: 5, sensorType: "HUMIDITY" },
  { deviceId: 6, label: "서버실 온도센서 (zone7)", zoneId: 7, sensorType: "TEMPERATURE" },
  { deviceId: 7, label: "회의실A 전력미터 (zone2)", zoneId: 2, sensorType: "POWER" },
  { deviceId: 8, label: "회의실B 전력미터 (zone4)", zoneId: 4, sensorType: "POWER" },
  { deviceId: 9, label: "개발팀 전력미터 (zone5)", zoneId: 5, sensorType: "POWER" },
  { deviceId: 10, label: "서버실 전력미터 (zone7)", zoneId: 7, sensorType: "POWER" },
  { deviceId: 12, label: "휴게실 온도센서 (zone13, INACTIVE)", zoneId: 13, sensorType: "TEMPERATURE" },
];

// ─── 주차면 ↔ 장치 매핑 ─────────────────────────────────────────────────────
export interface SeedParkingSpot {
  spotId: number;
  deviceId: number;
  label: string;
}

export const SEED_PARKING_SPOTS: SeedParkingSpot[] = [
  { spotId: 6, deviceId: 13, label: "spotId 6 → device 13 (B1-006)" },
  { spotId: 7, deviceId: 14, label: "spotId 7 → device 14 (B1-007)" },
  { spotId: 8, deviceId: 15, label: "spotId 8 → device 15 (B1-008)" },
  { spotId: 9, deviceId: 16, label: "spotId 9 → device 16 (B1-009)" },
  { spotId: 16, deviceId: 17, label: "spotId 16 → device 17 (B2-016)" },
  { spotId: 17, deviceId: 18, label: "spotId 17 → device 18 (B2-017)" },
  { spotId: 18, deviceId: 19, label: "spotId 18 → device 19 (B2-018)" },
  { spotId: 19, deviceId: 20, label: "spotId 19 → device 20 (B2-019)" },
];

// ─── 랜덤 헬퍼 ───────────────────────────────────────────────────────────────

/** sensorType 범위에 맞는 랜덤 측정값을 반환한다. */
export function randomSensorValue(sensorType: SensorType): number {
  switch (sensorType) {
    case "TEMPERATURE": return parseFloat((18 + Math.random() * 12).toFixed(1));
    case "HUMIDITY":    return parseFloat((30 + Math.random() * 40).toFixed(1));
    case "CO2":         return Math.floor(400 + Math.random() * 800);
    case "POWER":       return parseFloat((50 + Math.random() * 1950).toFixed(1));
  }
}

/** sensorType 에 대응하는 단위 문자열을 반환한다. */
export function sensorUnit(sensorType: SensorType): string {
  switch (sensorType) {
    case "TEMPERATURE": return "°C";
    case "HUMIDITY":    return "%";
    case "CO2":         return "ppm";
    case "POWER":       return "W";
  }
}

/** occupied 여부에 따라 distanceCm 랜덤 값을 반환한다. */
export function randomDistanceCm(occupied: boolean): number {
  return occupied
    ? Math.floor(5 + Math.random() * 35)
    : Math.floor(80 + Math.random() * 120);
}

/** 현재 시각을 "yyyy-MM-ddTHH:mm:ss" 형식으로 반환한다. */
export function nowLocalDateTime(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  );
}

/** 오늘 날짜를 "yyyy-MM-dd" 형식으로 반환한다. */
export function todayDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** 배열에서 무작위 요소를 반환한다. */
export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
