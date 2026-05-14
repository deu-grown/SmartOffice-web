// 제어(control) 도메인 TanStack Query 키 factory.
export const controlKeys = {
  all: ["control"] as const,
  detail: (id: number) => [...controlKeys.all, "detail", id] as const,
  history: (zoneId?: number, startDate?: string) =>
    [...controlKeys.all, "history", zoneId ?? null, startDate ?? null] as const,
};
