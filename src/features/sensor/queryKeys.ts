// 센서(sensor) 도메인 TanStack Query 키 factory.
export const sensorKeys = {
  all: ["sensor"] as const,
  latest: (zoneId: number) => [...sensorKeys.all, "latest", zoneId] as const,
  history: (zoneId: number, startDate: string, endDate: string) =>
    [...sensorKeys.all, "history", zoneId, startDate, endDate] as const,
};
