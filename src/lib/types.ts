export interface Segment {
  label: string;
  duration_secs: number;
}

export type TimerStatus = "Running" | "Paused" | "Stopped";

export interface TimerState {
  status: TimerStatus;
  remaining_secs: number;
  current_segment: number;
  total_segments: number;
  segment_label: string;
  segment_duration: number;
}

export interface TickPayload {
  remaining_secs: number;
  segment_index: number;
  segment_label: string;
  total_segments: number;
  segment_duration: number;
}

export interface SegmentEndPayload {
  completed_label: string;
  completed_index: number;
  next_label: string | null;
  next_index: number | null;
}

export interface StateChangePayload {
  status: TimerStatus;
}

export interface Settings {
  notification_enabled: boolean;
  sound_enabled: boolean;
  sound_name: string;
  volume: number;
  auto_start_next: boolean;
  always_on_top: boolean;
  show_clock: boolean;
  visible_on_all_workspaces: boolean;
}

export interface Session {
  name: string;
  segments: Segment[];
  is_preset: boolean;
}
