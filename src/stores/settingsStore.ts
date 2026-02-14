import { create } from "zustand";
import type { Settings } from "@/lib/types";

interface SettingsStore {
  settings: Settings;
  settingsOpen: boolean;
  sessionEditorOpen: boolean;
  setSettings: (settings: Settings) => void;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  setSettingsOpen: (open: boolean) => void;
  setSessionEditorOpen: (open: boolean) => void;
}

const defaultSettings: Settings = {
  notification_enabled: true,
  sound_enabled: true,
  sound_name: "bell",
  volume: 0.7,
  auto_start_next: false,
  always_on_top: false,
  show_clock: false,
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  settingsOpen: false,
  sessionEditorOpen: false,

  setSettings: (settings) => set({ settings }),

  updateSetting: (key, value) =>
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    })),

  setSettingsOpen: (open) => set({ settingsOpen: open }),

  setSessionEditorOpen: (open) => set({ sessionEditorOpen: open }),
}));
