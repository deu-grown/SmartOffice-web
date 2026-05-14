// 직원 도메인 REST API 호출 (6 엔드포인트). thin wrapper.
// GET /users/{id}/access-logs 는 임시로 본 객체에 inline — C9 에서 features/accesslog 로 이관 예정.
import { apiDelete, apiGet, apiPost, apiPut } from "@/src/lib/api/client";
import type { PageResponse } from "@/src/lib/api/types";

import type {
  UserAccessLogList,
  UserAccessLogsQuery,
  UserCreateRequest,
  UserCreateResponse,
  UserDetail,
  UserListFilter,
  UserListItem,
  UserUpdateRequest,
  UserUpdateResponse,
} from "./types";

export const userApi = {
  /** 직원 목록 (페이지네이션·필터). */
  list: (filter?: UserListFilter) =>
    apiGet<PageResponse<UserListItem>>("/users", { params: filter }),
  /** 직원 등록 (초기 비밀번호 = 사번). */
  create: (body: UserCreateRequest) =>
    apiPost<UserCreateResponse, UserCreateRequest>("/users", body),
  /** 직원 상세. */
  detail: (id: number) => apiGet<UserDetail>(`/users/${id}`),
  /** 직원 정보 수정 (관리자). */
  update: (id: number, body: UserUpdateRequest) =>
    apiPut<UserUpdateResponse, UserUpdateRequest>(`/users/${id}`, body),
  /** 직원 퇴사 처리 (status=INACTIVE 전환, 복구 불가). */
  remove: (id: number) => apiDelete<void>(`/users/${id}`),
  /** 특정 직원 출입 이력 — C9 이관 예정. */
  accessLogs: (id: number, query?: UserAccessLogsQuery) =>
    apiGet<UserAccessLogList>(`/users/${id}/access-logs`, { params: query }),
};
