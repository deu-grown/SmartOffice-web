// 장치(device) 도메인 TanStack Query 키 factory.
export const deviceKeys = {
  all: ["device"] as const,
  list: () => [...deviceKeys.all, "list"] as const,
  detail: (id: number) => [...deviceKeys.all, "detail", id] as const,
};
