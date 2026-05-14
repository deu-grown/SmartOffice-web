// 직원 도메인 MSW 핸들러. 메모리 직원 목록 + 페이지네이션·필터 + CRUD 모방.
// GET /users/{id}/access-logs 는 임시로 본 파일에 inline (C9 이관 예정).
import { http, HttpResponse } from "msw";

interface UserRow {
  id: number;
  employeeNumber: string;
  name: string;
  email: string;
  role: string;
  position: string;
  department: string | null;
  departmentId: number;
  phone: string | null;
  status: string;
  hiredAt: string;
  createdAt: string;
  updatedAt: string;
}

let nextId = 4;
const users: UserRow[] = [
  {
    id: 1,
    employeeNumber: "EMP001",
    name: "관리자",
    email: "admin@grown.com",
    role: "ADMIN",
    position: "팀장",
    department: "개발팀",
    departmentId: 1,
    phone: "010-0000-0000",
    status: "ACTIVE",
    hiredAt: "2026-03-02",
    createdAt: "2026-03-02T09:00:00",
    updatedAt: "2026-03-02T09:00:00",
  },
  {
    id: 2,
    employeeNumber: "EMP002",
    name: "김호탈",
    email: "kimhotal@grown.com",
    role: "USER",
    position: "사원",
    department: "개발팀",
    departmentId: 1,
    phone: "010-1111-2222",
    status: "ACTIVE",
    hiredAt: "2026-03-15",
    createdAt: "2026-03-15T09:00:00",
    updatedAt: "2026-03-15T09:00:00",
  },
  {
    id: 3,
    employeeNumber: "EMP003",
    name: "이순신",
    email: "leesoonshin@grown.com",
    role: "USER",
    position: "대리",
    department: "운영팀",
    departmentId: 2,
    phone: "010-3333-4444",
    status: "ACTIVE",
    hiredAt: "2026-04-01",
    createdAt: "2026-04-01T09:00:00",
    updatedAt: "2026-04-01T09:00:00",
  },
];

function toListItem(u: UserRow) {
  return {
    id: u.id,
    employeeNumber: u.employeeNumber,
    name: u.name,
    email: u.email,
    role: u.role,
    position: u.position,
    department: u.department,
    phone: u.phone,
    status: u.status,
    hiredAt: u.hiredAt,
  };
}

export const userHandlers = [
  http.get("/api/v1/users", ({ request }) => {
    const url = new URL(request.url);
    const departmentId = url.searchParams.get("departmentId");
    const status = url.searchParams.get("status");
    const keyword = url.searchParams.get("keyword");
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);

    let filtered = users;
    if (departmentId) filtered = filtered.filter((u) => u.departmentId === Number(departmentId));
    if (status) filtered = filtered.filter((u) => u.status === status);
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(kw) ||
          u.employeeNumber.toLowerCase().includes(kw) ||
          u.email.toLowerCase().includes(kw),
      );
    }
    const totalElements = filtered.length;
    const totalPages = Math.max(Math.ceil(totalElements / size), 1);
    const sliced = filtered.slice(page * size, (page + 1) * size);
    return HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      data: {
        content: sliced.map(toListItem),
        page,
        size,
        totalElements,
        totalPages,
        last: page + 1 >= totalPages,
      },
    });
  }),

  http.post("/api/v1/users", async ({ request }) => {
    const body = (await request.json()) as {
      employeeNumber: string;
      name: string;
      email: string;
      role: string;
      position: string;
      departmentId: number;
      phone?: string;
      hiredAt: string;
    };
    const now = new Date().toISOString();
    const created: UserRow = {
      id: nextId++,
      employeeNumber: body.employeeNumber,
      name: body.name,
      email: body.email,
      role: body.role,
      position: body.position,
      department: "개발팀",
      departmentId: body.departmentId,
      phone: body.phone ?? null,
      status: "ACTIVE",
      hiredAt: body.hiredAt,
      createdAt: now,
      updatedAt: now,
    };
    users.push(created);
    return HttpResponse.json(
      {
        code: "success",
        message: "직원이 등록되었습니다.",
        data: {
          id: created.id,
          employeeNumber: created.employeeNumber,
          name: created.name,
          email: created.email,
          role: created.role,
          position: created.position,
          department: created.department,
          status: created.status,
          hiredAt: created.hiredAt,
          createdAt: created.createdAt,
        },
      },
      { status: 201 },
    );
  }),

  http.get("/api/v1/users/:id", ({ params }) => {
    const id = Number(params.id);
    const u = users.find((x) => x.id === id);
    if (!u) {
      return HttpResponse.json(
        { code: "error", message: "직원을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      data: { ...toListItem(u), createdAt: u.createdAt, updatedAt: u.updatedAt },
    });
  }),

  http.put("/api/v1/users/:id", async ({ request, params }) => {
    const id = Number(params.id);
    const u = users.find((x) => x.id === id);
    if (!u) {
      return HttpResponse.json(
        { code: "error", message: "직원을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    const body = (await request.json()) as Partial<UserRow>;
    if (body.name !== undefined) u.name = body.name;
    if (body.role !== undefined) u.role = body.role;
    if (body.position !== undefined) u.position = body.position;
    if (body.phone !== undefined) u.phone = body.phone;
    u.updatedAt = new Date().toISOString();
    return HttpResponse.json({
      code: "success",
      message: "직원 정보가 수정되었습니다.",
      data: {
        id: u.id,
        name: u.name,
        role: u.role,
        position: u.position,
        department: u.department,
        phone: u.phone,
        updatedAt: u.updatedAt,
      },
    });
  }),

  http.delete("/api/v1/users/:id", ({ params }) => {
    const id = Number(params.id);
    const u = users.find((x) => x.id === id);
    if (!u) {
      return HttpResponse.json(
        { code: "error", message: "직원을 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    u.status = "INACTIVE";
    return HttpResponse.json({
      code: "success",
      message: "퇴사 처리되었습니다.",
      data: null,
    });
  }),

  http.post("/api/v1/users/me", async ({ request }) => {
    const body = (await request.json()) as {
      phone?: string;
      password?: string;
      currentPassword?: string;
    };
    // 비밀번호 변경 시 currentPassword 필수 검증 (백엔드 정합).
    if (body.password && !body.currentPassword) {
      return HttpResponse.json(
        { code: "error", message: "현재 비밀번호가 필요합니다.", data: null },
        { status: 400 },
      );
    }
    const me = users[0];
    if (body.phone !== undefined) me.phone = body.phone || null;
    me.updatedAt = new Date().toISOString();
    return HttpResponse.json({
      code: "success",
      message: "정보가 수정되었습니다.",
      data: { phone: me.phone, updatedAt: me.updatedAt },
    });
  }),

  // GET /api/v1/users/{id}/access-logs 핸들러는 src/test/handlers/accesslog.ts 로 이관 (C9).
];

// 다른 핸들러(accesslog 등) 에서 users 컬렉션을 참조할 수 있도록 export.
export const __testUsersForAccessLog = users;
