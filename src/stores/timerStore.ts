import { create } from "zustand";
import type {
  TimerStatus,
  TickPayload,
  Session,
} from "../lib/types";

interface TimerStore {
  // Timer state
  status: TimerStatus;
  remainingSecs: number;
  currentSegment: number;
  totalSegments: number;
  segmentLabel: string;
  segmentDuration: number;

  // Session
  sessions: Session[];
  activeSessionIndex: number;

  // UI state
  overlayVisible: boolean;
  miniMode: boolean;

  // Actions
  setTick: (payload: TickPayload) => void;
  setStatus: (status: TimerStatus) => void;
  setSessions: (sessions: Session[]) => void;
  setActiveSessionIndex: (index: number) => void;
  setOverlayVisible: (visible: boolean) => void;
  setMiniMode: (mini: boolean) => void;
  reset: () => void;
}

export const useTimerStore = create<TimerStore>((set) => ({
  status: "Stopped",
  remainingSecs: 0,
  currentSegment: 0,
  totalSegments: 0,
  segmentLabel: "",
  segmentDuration: 0,

  sessions: [],
  activeSessionIndex: 0,

  overlayVisible: false,
  miniMode: false,

  setTick: (payload) =>
    set({
      remainingSecs: payload.remaining_secs,
      currentSegment: payload.segment_index,
      totalSegments: payload.total_segments,
      segmentLabel: payload.segment_label,
      segmentDuration: payload.segment_duration,
    }),

  setStatus: (status) => set({ status }),

  setSessions: (sessions) => set({ sessions }),

  setActiveSessionIndex: (index) => set({ activeSessionIndex: index }),

  setOverlayVisible: (visible) => set({ overlayVisible: visible }),

  setMiniMode: (mini) => set({ miniMode: mini }),

  reset: () =>
    set({
      status: "Stopped",
      remainingSecs: 0,
      currentSegment: 0,
      totalSegments: 0,
      segmentLabel: "",
      segmentDuration: 0,
    }),
}));
