// NFC 카드(nfccard) 도메인 TanStack Query 키 factory.
// namespace ["nfccard", ...] — user/department 와 충돌 없음.
import type { NfcCardListFilter } from "./types";

export const nfcCardKeys = {
  all: ["nfccard"] as const,
  list: (filter?: NfcCardListFilter) =>
    [...nfcCardKeys.all, "list", filter ?? {}] as const,
  detail: (id: number) => [...nfcCardKeys.all, "detail", id] as const,
};
