// 자산(asset) 도메인 상수.
// 백엔드 category 는 String free-form. 입력 일관성 + UX 통일 위해 7종 카테고리를 Select 옵션으로 사용.
// 백엔드 enum 도입 시 본 상수만 갱신 (단일 지점 수정).
import type { AssetStatus } from "./types";

export const ASSET_CATEGORIES = [
  "IT 기기",
  "서버 장비",
  "저장 매체",
  "비품",
  "중요 자산",
  "장비",
  "네트워크",
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

/** AssetStatus 한국어 라벨. */
export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  ACTIVE: "사용 중",
  INACTIVE: "보관",
  LOST: "분실",
};

export const ASSET_STATUSES: AssetStatus[] = ["ACTIVE", "INACTIVE", "LOST"];
