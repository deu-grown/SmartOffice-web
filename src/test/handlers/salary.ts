// 급여(salary) 도메인 MSW 핸들러. record 4 + setting 3 = 6 ADMIN 엔드포인트.
import { http, HttpResponse } from "msw";

type SalaryStatus = "DRAFT" | "CONFIRMED";

interface SalaryRecordRow {
  id: number;
  userId: number;
  userName: string;
  year: number;
  month: number;
  baseSalary: number;
  overtimePay: number;
  totalPay: number;
  status: SalaryStatus;
}

interface SalarySettingRow {
  id: number;
  position: string;
  baseSalary: number;
  overtimeRate: number;
  nightRate: number;
  effectiveFrom: string;
  effectiveTo: string | null;
}

let nextRecordId = 4;
const records: SalaryRecordRow[] = [
  { id: 1, userId: 2, userName: "김호탈", year: 2026, month: 3, baseSalary: 3100000, overtimePay: 230000, totalPay: 3500000, status: "DRAFT" },
  { id: 2, userId: 3, userName: "강덕순", year: 2026, month: 3, baseSalary: 3200000, overtimePay: 320000, totalPay: 3600000, status: "CONFIRMED" },
  { id: 3, userId: 4, userName: "임호탈", year: 2026, month: 3, baseSalary: 3300000, overtimePay: 450000, totalPay: 3700000, status: "DRAFT" },
];

let nextSettingId = 4;
const settings: SalarySettingRow[] = [
  { id: 1, position: "사원", baseSalary: 2500000, overtimeRate: 1.5, nightRate: 2.0, effectiveFrom: "2026-01-01", effectiveTo: null },
  { id: 2, position: "대리", baseSalary: 3000000, overtimeRate: 1.5, nightRate: 2.0, effectiveFrom: "2026-01-01", effectiveTo: null },
  { id: 3, position: "팀장", baseSalary: 4000000, overtimeRate: 1.5, nightRate: 2.0, effectiveFrom: "2026-01-01", effectiveTo: null },
];

export const salaryHandlers = [
  // ── record ────────────────────────────────────────────────
  http.get("/api/v1/salary/records", ({ request }) => {
    const url = new URL(request.url);
    const year = Number(url.searchParams.get("year"));
    const month = Number(url.searchParams.get("month"));
    const userId = url.searchParams.get("userId");
    const status = url.searchParams.get("status");
    const page = Number(url.searchParams.get("page") ?? "0");
    const size = Number(url.searchParams.get("size") ?? "20");

    let filtered = records.filter((r) => r.year === year && r.month === month);
    if (userId !== null) filtered = filtered.filter((r) => r.userId === Number(userId));
    if (status !== null) filtered = filtered.filter((r) => r.status === status);

    const start = page * size;
    const content = filtered.slice(start, start + size);

    return HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      data: {
        content,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        size,
        number: page,
        first: page === 0,
        last: start + size >= filtered.length,
        empty: content.length === 0,
      },
    });
  }),

  http.post("/api/v1/salary/records/calculate", async ({ request }) => {
    const body = (await request.json()) as { year: number; month: number; userIds?: number[] };
    // 위험 액션 시뮬레이션: 동일 year/month 의 DRAFT 만 덮어쓰기, CONFIRMED 는 스킵.
    let successCount = 0;
    let skipCount = 0;
    const targetUsers = body.userIds && body.userIds.length > 0 ? body.userIds : [2, 3, 4, 5];
    const calculatedRecords: SalaryRecordRow[] = [];
    for (const uid of targetUsers) {
      const existing = records.find((r) => r.year === body.year && r.month === body.month && r.userId === uid);
      if (existing && existing.status === "CONFIRMED") {
        skipCount += 1;
        calculatedRecords.push(existing);
        continue;
      }
      const newRecord: SalaryRecordRow = {
        id: existing ? existing.id : nextRecordId++,
        userId: uid,
        userName: `직원${uid}`,
        year: body.year,
        month: body.month,
        baseSalary: 3000000,
        overtimePay: 200000 + uid * 10000,
        totalPay: 3200000 + uid * 10000,
        status: "DRAFT",
      };
      if (existing) {
        Object.assign(existing, newRecord);
      } else {
        records.push(newRecord);
      }
      successCount += 1;
      calculatedRecords.push(newRecord);
    }
    return HttpResponse.json({
      code: "success",
      message: "급여 산출이 완료되었습니다.",
      data: {
        totalCount: targetUsers.length,
        successCount,
        skipCount,
        records: calculatedRecords,
      },
    });
  }),

  http.put("/api/v1/salary/records/:id/confirm", ({ params }) => {
    const id = Number(params.id);
    const target = records.find((r) => r.id === id);
    if (!target) {
      return HttpResponse.json({ code: "error", message: "급여 내역을 찾을 수 없습니다.", data: null }, { status: 404 });
    }
    target.status = "CONFIRMED";
    return HttpResponse.json({ code: "success", message: "급여가 확정되었습니다.", data: target });
  }),

  // ── setting ────────────────────────────────────────────────
  http.get("/api/v1/salary/settings", ({ request }) => {
    const url = new URL(request.url);
    const position = url.searchParams.get("position");
    let filtered = settings.slice();
    if (position !== null) filtered = filtered.filter((s) => s.position === position);
    return HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      data: filtered,
    });
  }),

  http.post("/api/v1/salary/settings", async ({ request }) => {
    const body = (await request.json()) as {
      position: string;
      baseSalary: number;
      overtimeRate?: number;
      nightRate?: number;
      effectiveFrom: string;
    };
    const created: SalarySettingRow = {
      id: nextSettingId++,
      position: body.position,
      baseSalary: body.baseSalary,
      overtimeRate: body.overtimeRate ?? 1.5,
      nightRate: body.nightRate ?? 2.0,
      effectiveFrom: body.effectiveFrom,
      effectiveTo: null,
    };
    settings.push(created);
    return HttpResponse.json({ code: "success", message: "급여 기준이 등록되었습니다.", data: created }, { status: 201 });
  }),

  http.put("/api/v1/salary/settings/:id", async ({ request, params }) => {
    const id = Number(params.id);
    const body = (await request.json()) as { baseSalary?: number; overtimeRate?: number; nightRate?: number };
    const target = settings.find((s) => s.id === id);
    if (!target) {
      return HttpResponse.json({ code: "error", message: "급여 기준을 찾을 수 없습니다.", data: null }, { status: 404 });
    }
    if (body.baseSalary !== undefined) target.baseSalary = body.baseSalary;
    if (body.overtimeRate !== undefined) target.overtimeRate = body.overtimeRate;
    if (body.nightRate !== undefined) target.nightRate = body.nightRate;
    return HttpResponse.json({ code: "success", message: "급여 기준이 수정되었습니다.", data: target });
  }),
];
