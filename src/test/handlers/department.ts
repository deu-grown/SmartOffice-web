// 부서 도메인 MSW 핸들러. 메모리에서 부서 목록 유지하여 CRUD 회귀 검증을 지원한다.
import { http, HttpResponse } from "msw";

interface DepartmentRow {
  id: number;
  name: string;
  description: string | null;
  userCount: number;
  createdAt: string;
}

let nextId = 4;
const departments: DepartmentRow[] = [
  {
    id: 1,
    name: "개발팀",
    description: "백엔드/프론트 개발",
    userCount: 4,
    createdAt: "2026-03-02T09:00:00",
  },
  {
    id: 2,
    name: "운영팀",
    description: "사무공간 운영",
    userCount: 3,
    createdAt: "2026-03-02T09:00:00",
  },
  {
    id: 3,
    name: "보안팀",
    description: null,
    userCount: 1,
    createdAt: "2026-03-02T09:00:00",
  },
];

export const departmentHandlers = [
  http.get("/api/v1/departments", () =>
    HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "정상 조회되었습니다.",
      data: departments,
    }),
  ),

  http.post("/api/v1/departments", async ({ request }) => {
    const body = (await request.json()) as { name: string; description?: string };
    const created: DepartmentRow = {
      id: nextId++,
      name: body.name,
      description: body.description ?? null,
      userCount: 0,
      createdAt: new Date().toISOString(),
    };
    departments.push(created);
    return HttpResponse.json(
      {
        code: "success",
        errorCode: null,
        message: "부서가 등록되었습니다.",
        data: {
          id: created.id,
          name: created.name,
          description: created.description,
          createdAt: created.createdAt,
        },
      },
      { status: 201 },
    );
  }),

  http.put("/api/v1/departments/:id", async ({ request, params }) => {
    const id = Number(params.id);
    const body = (await request.json()) as { name: string; description?: string };
    const target = departments.find((d) => d.id === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", errorCode: "DEPARTMENT_NOT_FOUND", message: "부서를 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    target.name = body.name;
    target.description = body.description ?? null;
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "부서 정보가 수정되었습니다.",
      data: {
        id: target.id,
        name: target.name,
        description: target.description,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  http.delete("/api/v1/departments/:id", ({ params }) => {
    const id = Number(params.id);
    const idx = departments.findIndex((d) => d.id === id);
    if (idx === -1) {
      return HttpResponse.json(
        { code: "error", errorCode: "DEPARTMENT_NOT_FOUND", message: "부서를 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    if (departments[idx].userCount > 0) {
      return HttpResponse.json(
        {
          code: "error",
          errorCode: "DEPARTMENT_HAS_USERS",
          message: "소속 직원이 있는 부서는 삭제할 수 없습니다.",
          data: null,
        },
        { status: 400 },
      );
    }
    departments.splice(idx, 1);
    return HttpResponse.json({
      code: "success",
      errorCode: null,
      message: "부서가 삭제되었습니다.",
      data: null,
    });
  }),
];
