import { useEffect } from "react";
import { useTimerStore } from "../stores/timerStore";
import { useSettingsStore } from "../stores/settingsStore";
import {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  skipSegment,
} from "../lib/commands";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function useKeyboardShortcuts() {
  const store = useTimerStore;
  const settingsStore = useSettingsStore;

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Don't handle if in an input field
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const state = store.getState();
      const settings = settingsStore.getState();

      switch (e.code) {
        case "Space": {
          e.preventDefault();
          if (state.status === "Running") {
            await pauseTimer();
          } else if (state.status === "Paused") {
            await resumeTimer();
          } else if (state.status === "Stopped" && state.sessions.length > 0) {
            const session = state.sessions[state.activeSessionIndex];
            if (session) {
              await startTimer(session.segments);
            }
          }
          break;
        }
        case "KeyS": {
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            if (state.status !== "Stopped") {
              await skipSegment();
            }
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          if (settings.settingsOpen) {
            settingsStore.getState().setSettingsOpen(false);
          } else if (settings.sessionEditorOpen) {
            settingsStore.getState().setSessionEditorOpen(false);
          } else if (state.status !== "Stopped") {
            await stopTimer();
          }
          break;
        }
        case "KeyF":
        case "F11": {
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const win = getCurrentWindow();
            const isFull = await win.isFullscreen();
            await win.setFullscreen(!isFull);
          }
          break;
        }
        case "KeyM": {
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            state.setMiniMode(!state.miniMode);
          }
          break;
        }
        case "KeyP": {
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const win = getCurrentWindow();
            const newVal = !settings.settings.always_on_top;
            await win.setAlwaysOnTop(newVal);
            settingsStore.getState().updateSetting("always_on_top", newVal);
          }
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}
