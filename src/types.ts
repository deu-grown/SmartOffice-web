
export interface User {
  id: number;
  email: string;
  name: string;
  department: string;
  position: string;
  role: string;
}

export interface LoginResponse {
  code: string;
  data: {
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
    tokenType: string;
    user: User;
  };
  message: string;
}

export interface PermissionSetting {
  id: string;
  name: string;
  type: "RANK" | "STAFF" | "DEPT";
  allowed: boolean;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  gateActive: boolean;
  floor: string;
  permissions: PermissionSetting[];
  groups: string[];
}

export type TabType = "통합 관제" | "인사 관리" | "게스트 관리" | "출입 기록 관리" | "구역 관리" | "급여 관리" | "재고 관리" | "주차 관리" | "건물 관리" | "회의실 관리" | "NFC 카드 관리";
