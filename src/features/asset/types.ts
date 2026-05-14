// 자산(asset) 도메인 타입 — 백엔드 com.grown.smartoffice.domain.asset.dto 와 1:1 매핑.
// AssetStatus enum: ACTIVE | INACTIVE | LOST (단순 자산 대장).
// category 는 String free-form — 입력 일관성을 위해 features/asset/constants.ts 의 ASSET_CATEGORIES 7종을 Select 옵션으로 사용.

/** 백엔드 AssetStatus enum 정합. */
export type AssetStatus = "ACTIVE" | "INACTIVE" | "LOST";

/** GET /api/v1/assets · GET /api/v1/assets/{id} 응답 (1:1). */
export interface AssetResponse {
  assetId: number;
  assetNumber: string;
  assetName: string;
  category: string;
  assignedUserId: number | null;
  assignedUserName: string | null;
  description: string | null;
  assetStatus: AssetStatus;
  purchasedAt: string | null; // ISO LocalDate
  createdAt: string; // ISO LocalDateTime
  updatedAt: string; // ISO LocalDateTime
}

/** POST /api/v1/assets 요청 (AssetCreateRequest). */
export interface AssetCreateRequest {
  assetNumber: string;
  assetName: string;
  category: string;
  assignedUserId?: number | null;
  description?: string | null;
  /** 미지정 시 서비스 기본값 ACTIVE. */
  assetStatus?: AssetStatus;
  purchasedAt?: string | null;
}

/** PUT /api/v1/assets/{id} 요청 (AssetUpdateRequest, 모든 필드 optional). */
export interface AssetUpdateRequest {
  assetNumber?: string;
  assetName?: string;
  category?: string;
  assignedUserId?: number | null;
  description?: string | null;
  assetStatus?: AssetStatus;
  purchasedAt?: string | null;
}

/** GET /api/v1/assets 쿼리 필터. */
export interface AssetListFilter {
  category?: string;
  status?: AssetStatus;
  assignedUserId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}
