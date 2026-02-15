import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useTimerStore } from "@/stores/timerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  loadSettings,
  loadSessions,
  getActiveSessionIndex,
  playSound,
  resumeTimer,
  pauseTimer,
  stopTimer,
  skipSegment,
} from "@/lib/commands";
import type {
  TickPayload,
  StateChangePayload,
  SegmentEndPayload,
} from "@/lib/types";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export function useTimerEvents() {
  const setTick = useTimerStore((s) => s.setTick);
  const setStatus = useTimerStore((s) => s.setStatus);
  const setSessions = useTimerStore((s) => s.setSessions);
  const setActiveSessionIndex = useTimerStore((s) => s.setActiveSessionIndex);
  const status = useTimerStore((s) => s.status);

  useEffect(() => {
    const win = getCurrentWindow();

    // Load initial data from Rust and apply window settings
    loadSettings().then(async (s) => {
      useSettingsStore.getState().setSettings(s);

      // Apply window settings on startup
      if (s.always_on_top) {
        try {
          await win.setAlwaysOnTop(true);
        } catch {
          // Window manager may not support this feature
        }
      }
      if (s.visible_on_all_workspaces) {
        try {
          await win.setVisibleOnAllWorkspaces(true);
        } catch {
          // Window manager may not support this feature
        }
      }
    });
    loadSessions().then((s) => setSessions(s));
    getActiveSessionIndex().then((i) => setActiveSessionIndex(i));

    // Request notification permission
    isPermissionGranted().then((granted) => {
      if (!granted) requestPermission();
    });
  }, [setSessions, setActiveSessionIndex]);

  useEffect(() => {
    const unlisteners: (() => void)[] = [];

    listen<TickPayload>("timer:tick", (e) => {
      setTick(e.payload);
    }).then((u) => unlisteners.push(u));

    listen<StateChangePayload>("timer:state-change", (e) => {
      setStatus(e.payload.status);
    }).then((u) => unlisteners.push(u));

    listen<SegmentEndPayload>("timer:segment-end", (e) => {
      const settings = useSettingsStore.getState().settings;

      // Play notification sound
      if (settings.sound_enabled) {
        playSound(settings.sound_name);
      }

      // Send system notification
      if (settings.notification_enabled) {
        const msg = e.payload.next_label
          ? `${e.payload.completed_label} done! Next: ${e.payload.next_label}`
          : `${e.payload.completed_label} done! Session complete.`;
        sendNotification({ title: "Foccus", body: msg });
      }

      // Auto-start next segment if enabled
      if (settings.auto_start_next && e.payload.next_label) {
        setTimeout(() => resumeTimer(), 500);
      }
    }).then((u) => unlisteners.push(u));

    listen("timer:session-complete", () => {
      const settings = useSettingsStore.getState().settings;
      if (settings.sound_enabled) {
        playSound(settings.sound_name);
      }
      if (settings.notification_enabled) {
        sendNotification({
          title: "Foccus",
          body: "Session complete! Great work.",
        });
      }
    }).then((u) => unlisteners.push(u));

    // Tray menu events
    listen("tray:start-pause", () => {
      const currentStatus = useTimerStore.getState().status;
      if (currentStatus === "Running") {
        pauseTimer();
      } else if (currentStatus === "Paused") {
        resumeTimer();
      }
    }).then((u) => unlisteners.push(u));

    listen("tray:skip", () => {
      skipSegment();
    }).then((u) => unlisteners.push(u));

    listen("tray:stop", () => {
      stopTimer();
    }).then((u) => unlisteners.push(u));

    return () => {
      unlisteners.forEach((u) => u());
    };
  }, [setTick, setStatus]);

  return { status };
}
