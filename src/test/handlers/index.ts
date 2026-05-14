// 도메인별 MSW 핸들러를 합쳐 export 하는 집합 모듈.
import type { HttpHandler } from "msw";

import { accessLogHandlers } from "./accesslog";
import { attendanceHandlers } from "./attendance";
import { authHandlers } from "./auth";
import { dashboardHandlers } from "./dashboard";
import { departmentHandlers } from "./department";
import { deviceHandlers } from "./device";
import { powerHandlers } from "./power";
import { salaryHandlers } from "./salary";
import { sensorHandlers } from "./sensor";
import { userHandlers } from "./user";
import { zoneHandlers } from "./zone";

export const handlers: HttpHandler[] = [
  ...authHandlers,
  ...dashboardHandlers,
  ...departmentHandlers,
  ...powerHandlers,
  ...userHandlers,
  ...attendanceHandlers,
  ...accessLogHandlers,
  ...zoneHandlers,
  ...deviceHandlers,
  ...salaryHandlers,
  ...sensorHandlers,
];
