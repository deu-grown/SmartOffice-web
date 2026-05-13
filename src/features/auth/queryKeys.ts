// TanStack Query 의 queryKey factory. 도메인별로 한 곳에서 키를 관리해 invalidate 누락을 방지한다.
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};
