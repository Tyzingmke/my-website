import { create } from "zustand";

type UiState = { mode: "light" | "dark"; sidebarOpen: boolean; toggleMode: () => void; setSidebarOpen: (open: boolean) => void };
export const useUiStore = create<UiState>((set) => ({ mode: "light", sidebarOpen: false, toggleMode: () => set((state) => ({ mode: state.mode === "light" ? "dark" : "light" })), setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }) }));
