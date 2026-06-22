import { create } from "zustand";
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

let windowCounter = 0;

export const useOsStore = create<OsState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  nextZIndex: 100,
  isLocked: true,
  showLauncher: false,
  isGuest: false,

  openWindow: (app) => {
    const state = get();
    windowCounter++;
    const id = `win-${app.id}-${windowCounter}`;
    const existingWindow = state.windows.find(w => w.appId === app.id && !w.isMinimized);
    if (existingWindow) {
      get().focusWindow(existingWindow.id);
      return;
    }
    const newWindow: WindowState = {
      id,
      appId: app.id,
      title: app.name,
      x: 100 + (state.windows.length * 30) % 200,
      y: 60 + (state.windows.length * 30) % 150,
      width: app.defaultWidth,
      height: app.defaultHeight,
      zIndex: state.nextZIndex,
      isMinimized: false,
      isMaximized: false,
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
}));
