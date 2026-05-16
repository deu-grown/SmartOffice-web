// 하드웨어 대체 주입 훅 — 각 훅은 useMutation 래퍼 하나와 1:1 대응한다.
// onSuccess: queryClient 전체 무효화 → 주입 직후 운영 화면이 최신 데이터를 가져오도록.
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  postAttendanceBatch,
  postParkingStatus,
  postPowerBillingCalculate,
  postReservationCheckIn,
  postSensorLog,
  postTagEvent,
} from "./api";
import type {
  BatchTriggerRequest,
  PowerBillingCalculateRequest,
  ParkingStatusUpdateRequest,
  ReservationCheckInRequest,
  SensorLogRequest,
  TagEventRequest,
} from "./types";

export function useTagEventInjection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TagEventRequest) => postTagEvent(body),
    onSuccess: () => { queryClient.invalidateQueries(); },
  });
}

export function useSensorLogInjection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SensorLogRequest) => postSensorLog(body),
    onSuccess: () => { queryClient.invalidateQueries(); },
  });
}

export function useParkingStatusInjection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spotId, body }: { spotId: number; body: ParkingStatusUpdateRequest }) =>
      postParkingStatus(spotId, body),
    onSuccess: () => { queryClient.invalidateQueries(); },
  });
}

export function useAttendanceBatchInjection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BatchTriggerRequest) => postAttendanceBatch(body),
    onSuccess: () => { queryClient.invalidateQueries(); },
  });
}

export function usePowerBillingInjection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PowerBillingCalculateRequest) => postPowerBillingCalculate(body),
    onSuccess: () => { queryClient.invalidateQueries(); },
  });
}

export function useReservationCheckInInjection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ReservationCheckInRequest }) =>
      postReservationCheckIn(id, body),
    onSuccess: () => { queryClient.invalidateQueries(); },
  });
}
