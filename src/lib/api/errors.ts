// 백엔드 ErrorCode enum 식별자 → 한국어 메시지 매핑.
// 현재 백엔드의 에러 응답은 { code: "error", message: "한국어 메시지" } 구조라
// ErrorCode 식별자가 별도 필드로 내려오지 않는다. 따라서 이 맵은 보조 fallback 용이다.
// (1) 백엔드 message 가 있으면 그대로 사용
// (2) message 가 비어 있고 별도 코드 식별자가 있다면 이 맵으로 매핑
// (3) 그것마저 없다면 호출부에서 지정한 fallback 메시지 사용

export const ERROR_MESSAGES: Record<string, string> = {
  // 400
  INVALID_INPUT: "잘못된 입력값입니다.",
  MISSING_REQUIRED_FIELD: "필수 항목이 누락되었습니다.",
  INVALID_ZONE_HIERARCHY: "자기 자신 또는 하위 구역을 상위로 지정할 수 없습니다.",
  DEVICE_SPOT_MISMATCH: "장치 ID와 주차면 매핑이 일치하지 않습니다.",
  RESERVATION_TIME_CONFLICT: "해당 시간대에 이미 예약이 존재합니다.",
  RESERVATION_ALREADY_CANCELLED: "이미 취소된 예약입니다.",
  RESERVATION_CHECK_IN_NOT_ALLOWED:
    "체크인 가능 시간이 아닙니다. 예약 시작 10분 전부터 종료 전까지 가능합니다.",
  RESERVATION_END_BEFORE_START: "예약 종료 시각은 시작 시각 이후여야 합니다.",

  // 401
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 일치하지 않습니다.",
  INVALID_TOKEN: "유효하지 않은 토큰입니다.",
  TOKEN_EXPIRED: "만료된 액세스 토큰입니다.",
  UNAUTHENTICATED: "인증이 필요합니다.",

  // 403
  ACCOUNT_INACTIVE: "퇴사 처리된 계정입니다.",
  ACCESS_DENIED: "접근 권한이 없습니다.",
  REFRESH_TOKEN_EXPIRED: "Refresh Token이 만료되었습니다. 다시 로그인해주세요.",
  NFC_CARD_EXPIRED: "만료된 NFC 카드입니다.",

  // 404
  USER_NOT_FOUND: "사용자를 찾을 수 없습니다.",
  DEPARTMENT_NOT_FOUND: "부서를 찾을 수 없습니다.",
  ZONE_NOT_FOUND: "구역을 찾을 수 없습니다.",
  PARENT_ZONE_NOT_FOUND: "상위 구역을 찾을 수 없습니다.",
  DEVICE_NOT_FOUND: "장치를 찾을 수 없습니다.",
  NFC_CARD_NOT_FOUND: "등록되지 않은 NFC 카드입니다.",
  ATTENDANCE_NOT_FOUND: "근태 정보를 찾을 수 없습니다.",
  SALARY_SETTING_NOT_FOUND: "급여 기준을 찾을 수 없습니다.",
  SALARY_RECORD_NOT_FOUND: "급여 산출 내역을 찾을 수 없습니다.",
  MONTHLY_ATTENDANCE_NOT_FOUND: "해당 월 근태 집계 데이터가 없습니다.",
  ASSET_NOT_FOUND: "자산을 찾을 수 없습니다.",
  CONTROL_NOT_FOUND: "제어 명령을 찾을 수 없습니다.",
  RESERVATION_NOT_FOUND: "예약 정보를 찾을 수 없습니다.",
  POWER_DATA_NOT_FOUND: "해당 월 전력 집계 데이터가 없습니다.",
  PARKING_SPOT_NOT_FOUND: "주차면을 찾을 수 없습니다.",

  // 409
  DUPLICATE_EMAIL: "이미 사용 중인 이메일입니다.",
  DUPLICATE_EMPLOYEE_NUMBER: "이미 사용 중인 사번입니다.",
  DUPLICATE_NFC_CARD: "이미 등록된 NFC 카드 UID입니다.",
  ALREADY_HAS_ACTIVE_CARD: "해당 직원에게 이미 활성화된 NFC 카드가 존재합니다.",
  NFC_CARD_HAS_ACCESS_LOGS: "출입 로그가 존재하는 카드는 삭제할 수 없습니다.",
  DUPLICATE_DEPARTMENT_NAME: "이미 존재하는 부서명입니다.",
  DEPARTMENT_HAS_USERS: "소속 직원이 존재하여 삭제할 수 없습니다.",
  DUPLICATE_ZONE_NAME: "동일 상위 구역 내 중복 구역명입니다.",
  DUPLICATE_DEVICE_NAME: "이미 존재하는 장치명입니다.",
  DUPLICATE_SERIAL_NUMBER: "이미 등록된 시리얼 번호입니다.",
  ZONE_HAS_CHILDREN: "하위 구역이 존재하여 삭제할 수 없습니다.",
  ZONE_HAS_DEVICES: "설치된 장치가 존재하여 삭제할 수 없습니다.",
  USER_ALREADY_INACTIVE: "이미 퇴사 처리된 직원입니다.",
  SALARY_SETTING_USED: "이미 급여 산출에 사용된 기준으로 수정할 수 없습니다.",
  SALARY_RECORD_ALREADY_CONFIRMED: "이미 확정된 급여 내역입니다.",
  NO_APPLICABLE_SALARY_SETTING: "해당 직급의 적용 가능한 급여 기준이 없습니다.",
  DUPLICATE_ASSET_NUMBER: "이미 사용 중인 자산 번호입니다.",
  DUPLICATE_SPOT_NUMBER: "동일 구역 내 중복된 주차면 번호입니다.",
  DEVICE_ALREADY_MAPPED: "이미 다른 주차면에 매핑된 장치입니다.",

  // 422
  WRONG_PASSWORD: "현재 비밀번호가 일치하지 않습니다.",

  // 500
  INTERNAL_SERVER_ERROR: "서버 내부 오류가 발생했습니다.",
};

export const DEFAULT_ERROR_MESSAGE = "요청 처리 중 오류가 발생했습니다.";
export const NETWORK_ERROR_MESSAGE = "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

/**
 * 백엔드 응답 message 가 있으면 그대로 사용. 없으면 fallback 으로 대체.
 */
export function getErrorMessage(
  serverMessage: string | undefined | null,
  fallback: string = DEFAULT_ERROR_MESSAGE,
): string {
  if (serverMessage && serverMessage.trim()) {
    return serverMessage;
  }
  return fallback;
}

/**
 * 백엔드가 향후 code 필드에 ErrorCode 식별자를 넣어준다면 사용할 수 있는 보조 함수.
 * 현재 백엔드 응답은 code: "success" | "error" 두 값만 보낸다.
 */
export function resolveErrorCodeMessage(
  errorCode: string,
  fallback: string = DEFAULT_ERROR_MESSAGE,
): string {
  return ERROR_MESSAGES[errorCode] ?? fallback;
}
