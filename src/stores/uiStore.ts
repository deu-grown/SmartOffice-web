// UI 토글 등 클라이언트 전용 상태를 모은 Zustand 스토어.
// 서버 데이터(직원, 출입로그 등)는 TanStack Query 가 담당하므로 이 스토어에 두지 않는다.
import { create } from "zustand";
import { persist } from "zustand/middleware";

// 본 작업에서는 light 고정. 다크모드 토글 UI 와 액션은 후속 작업에서 도입한다.
type Theme = "light";

interface UIState {
  sidebarCollapsed: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: "light",
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: "smartoffice-ui",
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
