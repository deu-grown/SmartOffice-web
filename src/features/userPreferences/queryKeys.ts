// 사용자 환경설정(userPreferences) TanStack Query 키 factory.
export const userPreferencesKeys = {
  all: ["userPreferences"] as const,
  me: () => [...userPreferencesKeys.all, "me"] as const,
};
