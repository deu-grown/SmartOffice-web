// 도메인별 MSW 핸들러를 합쳐 export 하는 집합 모듈.
import type { HttpHandler } from "msw";

export const handlers: HttpHandler[] = [];
