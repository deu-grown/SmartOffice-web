// 예약(reservation) 도메인 React Query 훅.
// mutation 성공 시 reservationKeys.all 전체 invalidate — 목록/상세/구역별 모두 stale 처리.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { reservationApi } from "./api";
import { reservationKeys } from "./queryKeys";
import type { ReservationListFilter, ReservationUpdateRequest } from "./types";

/** 전체 예약 목록 [ADMIN]. status/page/size 필터. */
export function useAllReservations(filter?: ReservationListFilter) {
  return useQuery({
    queryKey: reservationKeys.list(filter),
    queryFn: () => reservationApi.listAll(filter),
  });
}

/** 예약 상세. */
export function useReservationDetail(id: number | undefined) {
  return useQuery({
    queryKey: reservationKeys.detail(id ?? -1),
    queryFn: () => reservationApi.detail(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

/** 구역별 예약 현황 (date 미지정 시 백엔드가 오늘 기준 처리). cat 5 — 인증만 요구. */
export function useZoneReservations(zoneId: number | undefined, date?: string) {
  return useQuery({
    queryKey: reservationKeys.zone(zoneId ?? -1, date),
    queryFn: () => reservationApi.zoneReservations(zoneId as number, date),
    enabled: typeof zoneId === "number" && zoneId > 0,
  });
}

/** 예약 수정 (본인/ADMIN). 본 web 은 ADMIN 운영 — 타인 예약 강제 수정 가능. */
export function useUpdateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ReservationUpdateRequest }) =>
      reservationApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

/** 예약 취소 (본인/ADMIN). 응답은 취소된 reservationId. */
export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reservationApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}
