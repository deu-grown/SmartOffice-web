// 사용자 환경설정(userPreferences) 도메인 타입 — 백엔드 응답과 1:1 매핑.
// GET/PUT /api/v1/users/me/preferences (JWT subject 기준, 최초 조회 시 기본값 lazy 생성).

/** GET /api/v1/users/me/preferences 응답. */
export interface UserPreferencesResponse {
  userId: number;
  notificationsEnabled: boolean;
  language: string; // "ko" | "en"
  theme: string;    // "light" | "dark"
  pushToken: string | null;
  updatedAt: string; // ISO LocalDateTime
}

/** PUT /api/v1/users/me/preferences 요청 (부분 수정 — null 필드는 기존 값 유지). */
export interface UserPreferencesUpdateRequest {
  notificationsEnabled?: boolean;
  language?: string;
  theme?: string;
  pushToken?: string | null;
}
