// NFC 카드(nfccard) 도메인 MSW 핸들러. ADMIN 5종.
// GET /nfc-cards 는 List 직반환. UID 중복 검증 + 출입 로그 보유 카드 삭제 차단 시뮬레이션.
import { http, HttpResponse } from "msw";

import type {
  NfcCardDetail,
  NfcCardListItem,
  NfcCardRegisterRequest,
  NfcCardStatus,
  NfcCardUpdateRequest,
} from "@/src/features/nfccard/types";

let nextId = 7;

// 백엔드 시드 기반 더미 6건 (ACTIVE 4 + LOST 1 + INACTIVE 1).
const cards: NfcCardDetail[] = [
  {
    id: 1,
    uid: "04A1B2C3D4E5F6",
    cardType: "EMPLOYEE",
    status: "ACTIVE",
    userId: 1,
    userName: "관리자",
    employeeNumber: "EMP-0001",
    department: "경영지원",
    issuedAt: "2026-03-02T09:00:00",
    expiredAt: "2027-03-02T09:00:00",
    createdAt: "2026-03-02T09:00:00",
    updatedAt: "2026-03-02T09:00:00",
  },
  {
    id: 2,
    uid: "04B2C3D4E5F607",
    cardType: "EMPLOYEE",
    status: "ACTIVE",
    userId: 2,
    userName: "박성종",
    employeeNumber: "EMP-0002",
    department: "개발",
    issuedAt: "2026-03-02T09:05:00",
    expiredAt: "2027-03-02T09:05:00",
    createdAt: "2026-03-02T09:05:00",
    updatedAt: "2026-03-02T09:05:00",
  },
  {
    id: 3,
    uid: "04C3D4E5F60718",
    cardType: "EMPLOYEE",
    status: "ACTIVE",
    userId: 3,
    userName: "김민지",
    employeeNumber: "EMP-0003",
    department: "디자인",
    issuedAt: "2026-03-02T09:10:00",
    expiredAt: "2027-03-02T09:10:00",
    createdAt: "2026-03-02T09:10:00",
    updatedAt: "2026-03-02T09:10:00",
  },
  {
    id: 4,
    uid: "04D4E5F6071829",
    cardType: "EMPLOYEE",
    status: "ACTIVE",
    userId: 4,
    userName: "이재훈",
    employeeNumber: "EMP-0004",
    department: "개발",
    issuedAt: "2026-03-02T09:15:00",
    expiredAt: "2027-03-02T09:15:00",
    createdAt: "2026-03-02T09:15:00",
    updatedAt: "2026-03-02T09:15:00",
  },
  {
    id: 5,
    uid: "04E5F60718293A",
    cardType: "VISITOR",
    status: "LOST",
    userId: 5,
    userName: "정유진",
    employeeNumber: "EMP-0005",
    department: "마케팅",
    issuedAt: "2026-04-10T10:00:00",
    expiredAt: "2026-04-17T10:00:00",
    createdAt: "2026-04-10T10:00:00",
    updatedAt: "2026-04-15T15:00:00",
  },
  {
    id: 6,
    uid: "04F60718293A4B",
    cardType: "TEMP",
    status: "INACTIVE",
    userId: 2,
    userName: "박성종",
    employeeNumber: "EMP-0002",
    department: "개발",
    issuedAt: "2026-03-15T11:00:00",
    expiredAt: "2026-03-22T11:00:00",
    createdAt: "2026-03-15T11:00:00",
    updatedAt: "2026-03-22T11:00:00",
  },
];

function toListItem(c: NfcCardDetail): NfcCardListItem {
  return {
    id: c.id,
    uid: c.uid,
    cardType: c.cardType,
    status: c.status,
    userId: c.userId,
    userName: c.userName,
    employeeNumber: c.employeeNumber,
    issuedAt: c.issuedAt,
    expiredAt: c.expiredAt,
  };
}

export const nfcCardHandlers = [
  // NFC 카드 목록 — List 직반환.
  http.get("/api/v1/nfc-cards", ({ request }) => {
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get("userId");
    const cardType = url.searchParams.get("cardType");
    const status = url.searchParams.get("status") as NfcCardStatus | null;

    let filtered = cards;
    if (userIdParam) {
      const uid = Number(userIdParam);
      filtered = filtered.filter((c) => c.userId === uid);
    }
    if (cardType) filtered = filtered.filter((c) => c.cardType === cardType);
    if (status) filtered = filtered.filter((c) => c.status === status);

    return HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      data: filtered.map(toListItem),
    });
  }),

  // NFC 카드 상세.
  http.get("/api/v1/nfc-cards/:id", ({ params }) => {
    const id = Number(params.id);
    const target = cards.find((c) => c.id === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", message: "NFC 카드를 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      code: "success",
      message: "정상 조회되었습니다.",
      data: target,
    });
  }),

  // NFC 카드 발급 — UID 중복 검증.
  http.post("/api/v1/nfc-cards", async ({ request }) => {
    const body = (await request.json()) as NfcCardRegisterRequest;
    if (cards.some((c) => c.uid === body.uid)) {
      return HttpResponse.json(
        { code: "error", message: "이미 등록된 NFC UID 입니다.", data: null },
        { status: 409 },
      );
    }
    const now = new Date().toISOString().replace("Z", "");
    const created: NfcCardDetail = {
      id: nextId++,
      uid: body.uid,
      cardType: body.cardType,
      status: "ACTIVE",
      userId: body.userId,
      userName: `사용자 ${body.userId}`,
      employeeNumber: `EMP-${String(body.userId).padStart(4, "0")}`,
      department: null,
      issuedAt: now,
      expiredAt: body.expiredAt ?? null,
      createdAt: now,
      updatedAt: now,
    };
    cards.push(created);
    return HttpResponse.json(
      {
        code: "success",
        message: "NFC 카드가 발급되었습니다.",
        data: {
          id: created.id,
          uid: created.uid,
          cardType: created.cardType,
          status: created.status,
          userId: created.userId,
          userName: created.userName,
          issuedAt: created.issuedAt,
          expiredAt: created.expiredAt,
        },
      },
      { status: 201 },
    );
  }),

  // NFC 카드 수정 (status + expiredAt).
  http.put("/api/v1/nfc-cards/:id", async ({ params, request }) => {
    const id = Number(params.id);
    const target = cards.find((c) => c.id === id);
    if (!target) {
      return HttpResponse.json(
        { code: "error", message: "NFC 카드를 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    const body = (await request.json()) as NfcCardUpdateRequest;
    if (body.status !== undefined) target.status = body.status;
    if (body.expiredAt !== undefined) target.expiredAt = body.expiredAt;
    target.updatedAt = new Date().toISOString().replace("Z", "");
    return HttpResponse.json({
      code: "success",
      message: "카드 정보가 수정되었습니다.",
      data: {
        id: target.id,
        uid: target.uid,
        status: target.status,
        expiredAt: target.expiredAt,
        updatedAt: target.updatedAt,
      },
    });
  }),

  // NFC 카드 삭제. mock 한정으로 출입 로그 보유 차단 미구현 (모든 ID 삭제 허용).
  http.delete("/api/v1/nfc-cards/:id", ({ params }) => {
    const id = Number(params.id);
    const idx = cards.findIndex((c) => c.id === id);
    if (idx === -1) {
      return HttpResponse.json(
        { code: "error", message: "NFC 카드를 찾을 수 없습니다.", data: null },
        { status: 404 },
      );
    }
    cards.splice(idx, 1);
    return HttpResponse.json({
      code: "success",
      message: "NFC 카드가 삭제되었습니다.",
      data: null,
    });
  }),
];
