// 사용자 환경설정(userPreferences) MSW 핸들러.
import { http, HttpResponse } from "msw";

import type { UserPreferencesResponse } from "@/src/features/userPreferences/types";

const prefs: UserPreferencesResponse = {
  userId: 1,
  notificationsEnabled: true,
  language: "ko",
  theme: "light",
  pushToken: null,
  updatedAt: "2026-05-15T09:00:00",
};

export const userPreferencesHandlers = [
  http.get("/api/v1/users/me/preferences", () => {
    return HttpResponse.json({ code: "success", errorCode: null, message: "정상 조회되었습니다.", data: { ...prefs } });
  }),

  http.put("/api/v1/users/me/preferences", async ({ request }) => {
    const body = (await request.json()) as Partial<UserPreferencesResponse>;
    if (body.notificationsEnabled !== undefined) prefs.notificationsEnabled = body.notificationsEnabled;
    if (body.language !== undefined) prefs.language = body.language;
    if (body.theme !== undefined) prefs.theme = body.theme;
    if (body.pushToken !== undefined) prefs.pushToken = body.pushToken;
    prefs.updatedAt = new Date().toISOString();
    return HttpResponse.json({ code: "success", errorCode: null, message: "환경설정이 저장되었습니다.", data: { ...prefs } });
  }),
];
