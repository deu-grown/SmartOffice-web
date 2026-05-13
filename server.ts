import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";
import cors from "cors";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // Health check to verify server is running correctly
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Proxy API requests to avoid CORS issues
  app.post("/api/v1/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const normalizedEmail = email?.toLowerCase().trim();
      
      console.log(`[Login] Attempt for: ${normalizedEmail}`);

      // Development Fallback: Multi-user local authentication based on provided table
      const devUsers = [
        { id: "EMP001", name: "관리자", email: "admin@grown.com", role: "ADMIN", password: "EMP001", status: "ACTIVE", dept: "IT본부", pos: "부장" },
        { id: "EMP002", name: "이순신", email: "lee.sun@grown.com", role: "USER", password: "EMP002", status: "ACTIVE", dept: "영업팀", pos: "차장" },
        { id: "EMP003", name: "장보고", email: "jang.bo@grown.com", role: "USER", password: "EMP003", status: "ACTIVE", dept: "해상물류팀", pos: "과장" },
        { id: "EMP004", name: "세종대왕", email: "sejong.da@grown.com", role: "USER", password: "EMP004", status: "ACTIVE", dept: "기획전략실", pos: "실장" },
        { id: "EMP005", name: "문화왕", email: "moon.hwa@grown.com", role: "USER", password: "EMP005", status: "INACTIVE", dept: "문화사업팀", pos: "대리" },
        { id: "EMP006", name: "홍길동", email: "hong.gildong@grown.com", role: "USER", password: "EMP006", status: "ACTIVE", dept: "고객지원팀", pos: "사원" },
      ];

      const userMatch = devUsers.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);

      if (userMatch) {
        if (userMatch.status === "INACTIVE") {
          console.log(`[Login] Blocked: INACTIVE status for ${normalizedEmail}`);
          return res.status(403).json({
            code: "ACCOUNT_INACTIVE",
            message: "현재 휴면(INACTIVE) 상태인 계정입니다. 관리자에게 문의하세요."
          });
        }

        console.log(`[Login] Success (Local): ${normalizedEmail}`);
        return res.json({
          code: "success",
          message: "인증에 성공했습니다.",
          data: {
            accessToken: "dev-token-" + Date.now(),
            refreshToken: "dev-refresh-token-" + Date.now(),
            user: {
              id: userMatch.id,
              email: userMatch.email,
              name: userMatch.name,
              role: userMatch.role,
              department: userMatch.dept,
              position: userMatch.pos,
              profileImage: null,
              createdAt: new Date().toISOString()
            }
          }
        });
      }

      // If not in devUsers, proceed to real API proxy
      const apiUrl = process.env.VITE_API_URL || "https://api.grown.com";
      const targetUrl = `${apiUrl}/api/v1/auth/login`;
      
      console.log(`[Login] Proxying to: ${targetUrl}`);
      
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        body: JSON.stringify(req.body),
      });

      console.log(`[Login] Upstream status: ${response.status} ${response.statusText}`);
      
      const responseContentType = response.headers.get("content-type") || "";
      if (responseContentType.includes("application/json")) {
        const data = await response.json();
        return res.status(response.status).json(data);
      } else {
        const text = await response.text();
        console.error(`[Login] Non-JSON Upstream response (${response.status}):`, text.substring(0, 500));
        return res.status(response.status).json({
          code: "error",
          message: `API 서버(상태: ${response.status})에서 예상치 못한 응답을 받았습니다.`,
          detail: text.includes("403 Forbidden") ? "Forbidden: API 서버 접근이 거부되었습니다." : text.substring(0, 200)
        });
      }
    } catch (error) {
      console.error("[Login] Error:", error);
      return res.status(500).json({ 
        code: "error", 
        message: "로그인 처리 중 서버 내부 오류가 발생했습니다." 
      });
    }
  });

  // Dashboard - Summary
  app.get("/api/v1/dashboard/summary", async (req, res) => {
    try {
      // Local Auth Fallback
      if (!process.env.VITE_API_URL) {
        return res.json({
          code: "success",
          message: "조회 성공",
          data: {
            totalUsers: 542,
            todayReservations: 12,
            activeDevices: 128,
            pendingApprovals: 3
          }
        });
      }

      const apiUrl = process.env.VITE_API_URL;
      const targetUrl = `${apiUrl}/api/v1/dashboard/summary`;
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });

      if (response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        return res.status(response.status).json(data);
      }
      
      // If API fails or returns non-JSON, return default data for development
      return res.json({
        code: "success",
        data: { totalUsers: 542, todayReservations: 12, activeDevices: 128, pendingApprovals: 3 }
      });
    } catch (error) {
      res.json({ code: "success", data: { totalUsers: 542, todayReservations: 12, activeDevices: 128, pendingApprovals: 3 } });
    }
  });

  // Dashboard - Recent Access
  app.get("/api/v1/dashboard/access/recent", async (req, res) => {
    try {
      if (!process.env.VITE_API_URL) {
        return res.json({
          code: "success",
          data: [
            { id: 1, userName: "김철수", zoneName: "본관 1F 로비", accessTime: "2026-05-13T14:25:01Z", type: "IN" },
            { id: 2, userName: "이영희", zoneName: "연구동 3F", accessTime: "2026-05-13T14:22:15Z", type: "IN" },
            { id: 3, userName: "박민수", zoneName: "본관 4F 회의실", accessTime: "2026-05-13T14:18:42Z", type: "OUT" },
            { id: 4, userName: "최지우", zoneName: "지하주차장 B1", accessTime: "2026-05-13T14:15:10Z", type: "IN" },
            { id: 5, userName: "정다은", zoneName: "본관 2F 사무실", accessTime: "2026-05-13T14:10:55Z", type: "IN" },
          ]
        });
      }

      const apiUrl = process.env.VITE_API_URL;
      const limit = req.query.limit || 20;
      const targetUrl = `${apiUrl}/api/v1/dashboard/access/recent?limit=${limit}`;
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });

      if (response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        return res.status(response.status).json(data);
      }
      return res.status(500).json({ code: "error", message: "Invalid API response" });
    } catch (error) {
      res.status(500).json({ code: "error", message: "Proxy Error" });
    }
  });

  // Dashboard - Attendance Today
  app.get("/api/v1/dashboard/attendance/today", async (req, res) => {
    try {
      if (!process.env.VITE_API_URL) {
        return res.json({
          code: "success",
          data: { presentCount: 485, absentCount: 22, lateCount: 35, totalExpected: 542 }
        });
      }

      const apiUrl = process.env.VITE_API_URL;
      const targetUrl = `${apiUrl}/api/v1/dashboard/attendance/today`;
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });

      if (response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        return res.status(response.status).json(data);
      }
      return res.status(500).json({ code: "error", message: "Invalid API response" });
    } catch (error) {
      res.status(500).json({ code: "error", message: "Proxy Error" });
    }
  });

  // Dashboard - Sensors Current
  app.get("/api/v1/dashboard/sensors/current", async (req, res) => {
    try {
      if (!process.env.VITE_API_URL) {
        return res.json({
          code: "success",
          data: [
            { zoneId: 1, zoneName: "본관 전체", temp: 24.5, humi: 45, co2: 650, updatedAt: "2026-05-13T07:49:29Z" },
            { zoneId: 2, zoneName: "개발본부", temp: 23.8, humi: 42, co2: 710, updatedAt: "2026-05-13T07:49:20Z" },
            { zoneId: 3, zoneName: "연구동", temp: 22.5, humi: 48, co2: 580, updatedAt: "2026-05-13T07:49:15Z" },
            { zoneId: 4, zoneName: "데이터센터", temp: 19.0, humi: 35, co2: 420, updatedAt: "2026-05-13T07:49:10Z" },
          ]
        });
      }

      const apiUrl = process.env.VITE_API_URL;
      const targetUrl = `${apiUrl}/api/v1/dashboard/sensors/current`;
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });

      if (response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        return res.status(response.status).json(data);
      }
      return res.status(500).json({ code: "error", message: "Invalid API response" });
    } catch (error) {
      res.status(500).json({ code: "error", message: "Proxy Error" });
    }
  });

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[Global Error]:", err);
    res.status(500).json({ code: "error", message: "서버 내부 오류가 발생했습니다." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback - ONLY for GET requests that aren't API calls
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
