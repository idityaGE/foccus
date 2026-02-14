import { invoke } from "@tauri-apps/api/core";
import type { Segment, TimerState, Settings, Session } from "./types";

export const startTimer = (segments: Segment[]) =>
  invoke("start_timer", { segments });

export const pauseTimer = () => invoke("pause_timer");

export const resumeTimer = () => invoke("resume_timer");

export const stopTimer = () => invoke("stop_timer");

export const skipSegment = () => invoke("skip_segment");

export const getTimerState = () =>
  invoke<TimerState>("get_timer_state");

export const playSound = (soundName: string) =>
  invoke("play_sound", { soundName });

export const setVolume = (level: number) =>
  invoke("set_volume", { level });

export const loadSettings = () =>
  invoke<Settings>("load_settings");

export const saveSettings = (settings: Settings) =>
  invoke("save_settings", { settings });

export const loadSessions = () =>
  invoke<Session[]>("load_sessions");

export const saveSessions = (sessions: Session[]) =>
  invoke("save_sessions", { sessions });

export const getActiveSessionIndex = () =>
  invoke<number>("get_active_session_index");

export const setActiveSessionIndex = (index: number) =>
  invoke("set_active_session_index", { index });
