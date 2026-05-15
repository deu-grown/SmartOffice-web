// 라우트 경로 상수와 Sidebar TabType ↔ Path 양방향 매핑.
// 사이드바 메뉴 라벨(TabType)과 URL 경로를 한 곳에서 관리해 분기 일관성을 유지한다.
import type { TabType } from "@/src/types";

export const ROUTES = {
  LOGIN: "/login",
  ROOT: "/",
  DASHBOARD: "/dashboard",
  PERSONNEL: "/personnel",
  GUEST: "/guest",
  ACCESS_LOGS: "/access-logs",
  ZONES: "/zones",
  SALARY: "/salary",
  INVENTORY: "/inventory",
  PARKING: "/parking",
  BUILDING: "/building",
  MEETING_ROOMS: "/meeting-rooms",
  NFC_CARDS: "/nfc-cards",
  SETTINGS: "/settings",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

// 게스트 메뉴 사이드바 복구 완료 (묶음 6b — guest 도메인 실 API 연동).
export const TAB_TO_PATH: Record<TabType, string> = {
  "통합 관제": ROUTES.DASHBOARD,
  "건물 관리": ROUTES.BUILDING,
  "구역 관리": ROUTES.ZONES,
  "출입 기록 관리": ROUTES.ACCESS_LOGS,
  "재고 관리": ROUTES.INVENTORY,
  "인사 관리": ROUTES.PERSONNEL,
  "게스트 관리": ROUTES.GUEST,
  "급여 관리": ROUTES.SALARY,
  "주차 관리": ROUTES.PARKING,
  "회의실 관리": ROUTES.MEETING_ROOMS,
  "NFC 카드 관리": ROUTES.NFC_CARDS,
  "시스템 설정": ROUTES.SETTINGS,
};

export const PATH_TO_TAB: Record<string, TabType> = Object.fromEntries(
  Object.entries(TAB_TO_PATH).map(([tab, path]) => [path, tab as TabType]),
);
