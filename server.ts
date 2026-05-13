// prod 환경 전용 정적 서빙 서버.
// dev에서는 Vite 내장 서버(`npm run dev` = `vite`)를 사용하므로 이 파일을 거치지 않는다.
// API 프록시는 dev에서 vite.config.ts 의 server.proxy 가, prod에서는 인프라 레벨(예: nginx)이 담당한다.
import express from "express";
import path from "path";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const distPath = path.join(process.cwd(), "dist");

app.use(express.static(distPath));

// SPA fallback. /api/ 로 시작하지 않는 GET 요청은 index.html 로 응답한다.
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
