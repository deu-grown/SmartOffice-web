// 자산(asset) 도메인 상수.
// 백엔드 category 는 String free-form. 백엔드 시드 5종(IT기기/가구/소모품/사무기기/가전)에 정합 + "기타" 옵션 1종.
// 향후 운영 카테고리 정책 변경 시 본 상수만 갱신 (단일 지점 수정).
import type { AssetStatus } from "./types";

export const ASSET_CATEGORIES = [
  "IT기기",
  "가구",
  "소모품",
  "사무기기",
  "가전",
  "기타",
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

/** AssetStatus 한국어 라벨. */
export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  ACTIVE: "사용 중",
  INACTIVE: "보관",
  LOST: "분실",
};

export const ASSET_STATUSES: AssetStatus[] = ["ACTIVE", "INACTIVE", "LOST"];
