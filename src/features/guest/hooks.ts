// 방문객(guest) 도메인 React Query 훅.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { guestApi } from "./api";
import { guestKeys } from "./queryKeys";
import type { GuestCreateRequest, GuestFilter, GuestUpdateRequest } from "./types";

/** 방문객 목록 (필터·페이지네이션). */
export function useGuests(filter?: GuestFilter) {
  return useQuery({
    queryKey: guestKeys.list(filter),
    queryFn: () => guestApi.list(filter),
  });
}

/** 방문객 등록. */
export function useCreateGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: GuestCreateRequest) => guestApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.all });
    },
  });
}

/** 방문객 정보 수정. */
export function useUpdateGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: GuestUpdateRequest }) =>
      guestApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.all });
    },
  });
}

/** 방문객 삭제. */
export function useDeleteGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => guestApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.all });
    },
  });
}

/** 체크인 (SCHEDULED → VISITING). */
export function useCheckInGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => guestApi.checkIn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.all });
    },
  });
}

/** 체크아웃 (VISITING → COMPLETED). */
export function useCheckOutGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => guestApi.checkOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.all });
    },
  });
}
