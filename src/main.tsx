/// <reference types="vite/client" />
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";

import App from "./App.tsx";
import { LoginPage } from "./components/auth/LoginPage";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { QueryProvider } from "./providers/QueryProvider";
import { PrivateRoute, PublicOnlyRoute } from "./routes/guards";
import { ROUTES } from "./routes/paths";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path={ROUTES.LOGIN}
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <App />
                </PrivateRoute>
              }
            />
          </Routes>
          <Toaster theme="light" position="bottom-right" />
        </BrowserRouter>
      </QueryProvider>
    </ErrorBoundary>
  </StrictMode>,
);
