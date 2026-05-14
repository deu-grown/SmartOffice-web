// 부서 도메인 TanStack Query 키 factory. 목록 단일 키.
// 백엔드에 GET /departments/{id} 는 없으므로 detail 키 미정의.
export const departmentKeys = {
  all: ["department"] as const,
  list: () => [...departmentKeys.all, "list"] as const,
};
