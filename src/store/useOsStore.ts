import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AppRegistryEntry } from "@/apps/registry";

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  prevX?: number;
  prevY?: number;
  prevWidth?: number;
  prevHeight?: number;
}

interface OsState {
  windows: WindowState[];
  activeWindowId: string | null;
  nextZIndex: number;
  isLocked: boolean;
  showLauncher: boolean;
  isGuest: boolean;
  /**
   * Transient: an Agent Chat prompt waiting to be consumed. Set by a
   * workspace preset or a deep link; read + cleared by AgentChat on open.
   * Never persisted — the receiver "pops" it so the same prompt never
   * fires twice.
   */
  pendingAgentPrompt: string | null;
  setPendingAgentPrompt: (prompt: string | null) => void;
  openWindow: (app: AppRegistryEntry) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
  setLocked: (locked: boolean) => void;
  setShowLauncher: (show: boolean) => void;
  setGuest: (isGuest: boolean) => void;
}

const MOBILE_BREAKPOINT = 768;
const TOP_BAR_H = 36;

const isMobile = () =>
  typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;

let windowCounter = 0;

export const useOsStore = create<OsState>()(
  persist(
    (set, get) => ({
  windows: [],
  activeWindowId: null,
  nextZIndex: 100,
  isLocked: true,
  showLauncher: false,
  isGuest: false,
  pendingAgentPrompt: null,

  setPendingAgentPrompt: (pendingAgentPrompt) => set({ pendingAgentPrompt }),

  openWindow: (app) => {
    const state = get();
    windowCounter++;
    const id = `win-${app.id}-${windowCounter}`;
    const existingWindow = state.windows.find(w => w.appId === app.id && !w.isMinimized);
    if (existingWindow) {
      get().focusWindow(existingWindow.id);
      return;
    }
    const mobile = isMobile();
    const vw = typeof window !== "undefined" ? window.innerWidth  : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const newWindow: WindowState = {
      id,
      appId: app.id,
      title: app.name,
      x: mobile ? 0 : 100 + (state.windows.length * 30) % 200,
      y: mobile ? TOP_BAR_H : 60 + (state.windows.length * 30) % 150,
      width:  mobile ? vw                : app.defaultWidth,
      height: mobile ? vh - TOP_BAR_H    : app.defaultHeight,
      zIndex: state.nextZIndex,
      isMinimized: false,
      isMaximized: mobile,
      ...(mobile && {
        prevX: 100, prevY: 60,
        prevWidth: app.defaultWidth, prevHeight: app.defaultHeight,
      }),
    };
    set({
      windows: [...state.windows, newWindow],
      activeWindowId: id,
      nextZIndex: state.nextZIndex + 1,
    });
  },

  closeWindow: (id) => {
    const state = get();
    set({
      windows: state.windows.filter((w) => w.id !== id),
      activeWindowId: state.activeWindowId === id
        ? state.windows.filter((w) => w.id !== id && !w.isMinimized).slice(-1)[0]?.id || null
        : state.activeWindowId,
    });
  },

  focusWindow: (id) => {
    const state = get();
    const w = state.windows.find((w) => w.id === id);
    if (!w || w.isMinimized) return;
    set({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: state.nextZIndex, isMinimized: false } : w
      ),
      activeWindowId: id,
      nextZIndex: state.nextZIndex + 1,
    });
  },

  minimizeWindow: (id) => {
    const state = get();
    set({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      ),
      activeWindowId: state.activeWindowId === id
        ? state.windows.filter((w) => w.id !== id && !w.isMinimized).slice(-1)[0]?.id || null
        : state.activeWindowId,
    });
  },

  maximizeWindow: (id) => {
    const state = get();
    set({
      windows: state.windows.map((w) =>
        w.id === id && !w.isMaximized
          ? { ...w, prevX: w.x, prevY: w.y, prevWidth: w.width, prevHeight: w.height, x: 0, y: 36, width: window.innerWidth, height: window.innerHeight - 36, isMaximized: true, zIndex: state.nextZIndex }
          : w.id === id ? { ...w, isMaximized: true } : w
      ),
      activeWindowId: id,
      nextZIndex: state.nextZIndex + 1,
    });
  },

  restoreWindow: (id) => {
    const state = get();
    set({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, x: w.prevX ?? w.x, y: w.prevY ?? w.y, width: w.prevWidth ?? w.width, height: w.prevHeight ?? w.height, isMaximized: false }
          : w
      ),
    });
  },

  moveWindow: (id, x, y) => {
    const state = get();
    set({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, x: Math.max(0, x), y: Math.max(36, y) } : w
      ),
    });
  },

  resizeWindow: (id, width, height) => {
    const state = get();
    set({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, width: Math.max(300, width), height: Math.max(200, height) } : w
      ),
    });
  },

  setLocked: (locked) => set({ isLocked: locked }),
  setShowLauncher: (show) => set({ showLauncher: show }),
  setGuest: (isGuest) => set({ isGuest }),
    }),
    {
      name: "kali-webos:os",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Persist window layout + guest flag; isLocked and showLauncher stay
      // transient so reload always lands on the lock screen with no launcher.
      partialize: (state) => ({
        windows: state.windows.map((w) => ({ ...w, isMinimized: false })),
        activeWindowId: state.activeWindowId,
        nextZIndex: state.nextZIndex,
        isGuest: state.isGuest,
      }),
      // On rehydrate, if we're on mobile, auto-maximize every restored window
      // so phone/tablet users don't inherit desktop-sized windows that
      // overflow the viewport.
      onRehydrateStorage: () => (state) => {
        if (!state || typeof window === "undefined") return;
        if (window.innerWidth >= MOBILE_BREAKPOINT) return;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        state.windows = state.windows.map((w) => ({
          ...w,
          prevX: w.prevX ?? w.x,
          prevY: w.prevY ?? w.y,
          prevWidth:  w.prevWidth  ?? w.width,
          prevHeight: w.prevHeight ?? w.height,
          x: 0,
          y: TOP_BAR_H,
          width:  vw,
          height: vh - TOP_BAR_H,
          isMaximized: true,
        }));
      },
    },
  ),
);
