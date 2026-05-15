// 백엔드 공통 응답/페이지 래퍼 타입과 1:1 매핑.
// - ApiResponse<T> : com.grown.smartoffice.global.common.ApiResponse
// - PageResponse<T>: com.grown.smartoffice.global.common.PageResponse (Spring Page 가 아닌 custom record)

export type ApiResponseCode = "success" | "error";

export interface ApiResponse<T> {
  code: ApiResponseCode;
  errorCode: string | null;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// 인터셉터에서 throw 하는 표준 에러 객체. axios 의 AxiosError 와 별개로 우리 코드에서 통일된 형태.
export class ApiError extends Error {
  readonly status: number;
  readonly serverMessage: string;
  readonly errorCode: string | null;

  constructor(status: number, message: string, errorCode: string | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.serverMessage = message;
    this.errorCode = errorCode;
  }
}
