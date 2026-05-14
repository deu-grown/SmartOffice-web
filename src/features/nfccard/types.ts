// NFC 카드(nfccard) 도메인 타입 — 백엔드 com.grown.smartoffice.domain.nfccard.dto 와 1:1 매핑.
// 모든 5 엔드포인트 ADMIN 전용 (NfcCardController 클래스 레벨 @PreAuthorize("hasRole('ADMIN')")).
// cardType 은 백엔드 free-form String — UI 에서 추천 옵션(EMPLOYEE/VISITOR/TEMP) 만 제시하고 자유 입력 허용.

/** 백엔드 NfcCardStatus enum (3종). */
export type NfcCardStatus = "ACTIVE" | "LOST" | "INACTIVE";

/** GET /api/v1/nfc-cards 응답 = List<NfcCardListItemResponse>. */
export interface NfcCardListItem {
  id: number;
  uid: string;
  cardType: string;
  status: NfcCardStatus;
  userId: number;
  userName: string;
  employeeNumber: string;
  issuedAt: string; // ISO LocalDateTime
  expiredAt: string | null;
}

/** GET /api/v1/nfc-cards/{id} 응답 = NfcCardDetailResponse (department + createdAt/updatedAt 추가). */
export interface NfcCardDetail extends NfcCardListItem {
  department: string | null;
  createdAt: string;
  updatedAt: string;
}

/** POST /api/v1/nfc-cards 응답 = NfcCardRegisterResponse (department 미포함). */
export interface NfcCardRegisterResponse {
  id: number;
  uid: string;
  cardType: string;
  status: NfcCardStatus;
  userId: number;
  userName: string;
  issuedAt: string;
  expiredAt: string | null;
}

/** POST /api/v1/nfc-cards 요청. userId/uid/cardType 필수, expiredAt optional. */
export interface NfcCardRegisterRequest {
  userId: number;
  uid: string;
  cardType: string;
  expiredAt?: string | null;
}

/** PUT /api/v1/nfc-cards/{id} 응답 = NfcCardUpdateResponse. */
export interface NfcCardUpdateResponse {
  id: number;
  uid: string;
  status: NfcCardStatus;
  expiredAt: string | null;
  updatedAt: string;
}

/** PUT /api/v1/nfc-cards/{id} 요청 (status + expiredAt). */
export interface NfcCardUpdateRequest {
  status?: NfcCardStatus;
  expiredAt?: string | null;
}

/** GET /api/v1/nfc-cards 쿼리 필터. */
export interface NfcCardListFilter {
  userId?: number;
  cardType?: string;
  status?: NfcCardStatus;
}
