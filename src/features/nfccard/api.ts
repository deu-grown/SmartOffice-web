// NFC 카드(nfccard) 도메인 REST API 호출 — ADMIN 5 엔드포인트.
// GET /nfc-cards 응답은 List<NfcCardListItem> 직반환 (PageResponse 아님).
import { apiDelete, apiGet, apiPost, apiPut } from "@/src/lib/api/client";

import type {
  NfcCardDetail,
  NfcCardListFilter,
  NfcCardListItem,
  NfcCardRegisterRequest,
  NfcCardRegisterResponse,
  NfcCardUpdateRequest,
  NfcCardUpdateResponse,
} from "./types";

export const nfcCardApi = {
  /** NFC 카드 목록 (userId / cardType / status 필터). */
  list: (filter?: NfcCardListFilter) =>
    apiGet<NfcCardListItem[]>("/nfc-cards", { params: filter }),
  /** NFC 카드 상세 (department + createdAt/updatedAt 추가). */
  detail: (id: number) => apiGet<NfcCardDetail>(`/nfc-cards/${id}`),
  /** NFC 카드 발급. 백엔드가 UID 중복 검증. */
  register: (body: NfcCardRegisterRequest) =>
    apiPost<NfcCardRegisterResponse, NfcCardRegisterRequest>("/nfc-cards", body),
  /** NFC 카드 수정 (상태 변경 - 분실/회수/재활성, 만료일 수정). */
  update: (id: number, body: NfcCardUpdateRequest) =>
    apiPut<NfcCardUpdateResponse, NfcCardUpdateRequest>(`/nfc-cards/${id}`, body),
  /** NFC 카드 삭제. 출입 로그 보유 카드는 백엔드가 삭제 차단. */
  remove: (id: number) => apiDelete<void>(`/nfc-cards/${id}`),
};
