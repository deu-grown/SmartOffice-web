// NFC 카드(nfccard) 도메인 React Query 훅.
// PersonnelDetailDrawer 의 NFC 탭은 useNfcCards({ userId }) 재사용 — 별도 hook 신설 X.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { nfcCardApi } from "./api";
import { nfcCardKeys } from "./queryKeys";
import type {
  NfcCardListFilter,
  NfcCardRegisterRequest,
  NfcCardUpdateRequest,
} from "./types";

/** NFC 카드 목록 (userId / cardType / status 필터). */
export function useNfcCards(filter?: NfcCardListFilter) {
  return useQuery({
    queryKey: nfcCardKeys.list(filter),
    queryFn: () => nfcCardApi.list(filter),
  });
}

/** NFC 카드 상세 (department + createdAt/updatedAt 포함). */
export function useNfcCardDetail(id: number | undefined) {
  return useQuery({
    queryKey: nfcCardKeys.detail(id ?? -1),
    queryFn: () => nfcCardApi.detail(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

/** NFC 카드 발급. 백엔드 UID 중복 에러 메시지(한국어)는 호출부에서 toast 노출. */
export function useRegisterNfcCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: NfcCardRegisterRequest) => nfcCardApi.register(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nfcCardKeys.all });
    },
  });
}

/** NFC 카드 수정 (분실 처리·재활성·만료일 변경). */
export function useUpdateNfcCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: NfcCardUpdateRequest }) =>
      nfcCardApi.update(id, body),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: nfcCardKeys.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: nfcCardKeys.list() });
    },
  });
}

/** NFC 카드 삭제. 출입 로그 보유 카드는 백엔드가 차단 → 에러 메시지 toast 노출. */
export function useDeleteNfcCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => nfcCardApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: nfcCardKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: nfcCardKeys.list() });
    },
  });
}
