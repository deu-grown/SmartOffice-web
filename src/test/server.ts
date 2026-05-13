// MSW 노드 서버. 테스트 환경에서만 사용한다.
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
