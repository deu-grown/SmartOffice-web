// 사용자 환경설정(userPreferences) REST API 호출.
import { apiGet, apiPut } from "@/src/lib/api/client";

import type { UserPreferencesResponse, UserPreferencesUpdateRequest } from "./types";

export const userPreferencesApi = {
  /** 내 환경설정 조회. */
  get: () => apiGet<UserPreferencesResponse>("/users/me/preferences"),
  /** 내 환경설정 수정. */
  update: (body: UserPreferencesUpdateRequest) =>
    apiPut<UserPreferencesResponse, UserPreferencesUpdateRequest>("/users/me/preferences", body),
};
