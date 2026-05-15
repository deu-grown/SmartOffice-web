// 사용자 환경설정(userPreferences) React Query 훅.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { userPreferencesApi } from "./api";
import { userPreferencesKeys } from "./queryKeys";
import type { UserPreferencesUpdateRequest } from "./types";

/** 내 환경설정 조회. */
export function useUserPreferences() {
  return useQuery({
    queryKey: userPreferencesKeys.me(),
    queryFn: () => userPreferencesApi.get(),
  });
}

/** 내 환경설정 수정. */
export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UserPreferencesUpdateRequest) => userPreferencesApi.update(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userPreferencesKeys.all });
    },
  });
}
