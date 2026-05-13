// 백엔드 com.grown.smartoffice.domain.auth.dto 패키지와 1:1 매핑되는 타입.
// 인터셉터에서 ApiResponse<T> 의 data 만 언래핑되어 내려오므로 여기서는 unwrapped 모양만 정의.

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseUser {
  id: number;
  name: string;
  email: string;
  role: string;
  position: string;
  department: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: LoginResponseUser;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface MeResponse {
  id: number;
  employeeNumber: string;
  name: string;
  email: string;
  role: string;
  position: string;
  department: string;
  phone: string;
  hiredAt: string;
  status: string;
}
