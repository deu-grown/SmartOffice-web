// prod 환경 전용 정적 서빙 + API proxy 서버.
// dev에서는 Vite 내장 서버(`npm run dev` = `vite`)를 사용하므로 이 파일을 거치지 않는다.
//
// API 프록시:
// - 시연 환경 (npm run start): 본 서버의 createProxyMiddleware 가 /api/v1 → API_TARGET(default localhost:8080) 로 포워딩.
// - 운영 환경: 인프라 레벨(예: nginx) reverse-proxy 권장. 본 서버를 운영에 직접 노출 시에도 동작은 함.
import express from "express";
import path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const API_TARGET = process.env.API_TARGET || "http://localhost:8080";
const distPath = path.join(process.cwd(), "dist");

// /api/v1 → API_TARGET proxy. SPA fallback 보다 먼저 등록되어야 한다.
app.use(
  "/api/v1",
  createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
  }),
);

app.use(express.static(distPath));

// SPA fallback. /api/ 로 시작하지 않는 GET 요청은 index.html 로 응답한다.
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT} (API proxy → ${API_TARGET})`);
});
