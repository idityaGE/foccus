import type { Session } from "./types";

export const defaultPresets: Session[] = [
  {
    name: "Classic Pomodoro",
    segments: [
      { label: "Study", duration_secs: 1500 },
      { label: "Break", duration_secs: 300 },
      { label: "Study", duration_secs: 1500 },
      { label: "Break", duration_secs: 300 },
      { label: "Study", duration_secs: 1500 },
      { label: "Break", duration_secs: 300 },
      { label: "Study", duration_secs: 1500 },
      { label: "Break", duration_secs: 1200 },
    ],
    is_preset: true,
  },
  {
    name: "Short Focus",
    segments: [
      { label: "Study", duration_secs: 900 },
      { label: "Break", duration_secs: 180 },
      { label: "Study", duration_secs: 900 },
      { label: "Break", duration_secs: 600 },
    ],
    is_preset: true,
  },
  {
    name: "Deep Work",
    segments: [
      { label: "Study", duration_secs: 3000 },
      { label: "Break", duration_secs: 600 },
      { label: "Study", duration_secs: 3000 },
      { label: "Break", duration_secs: 1200 },
    ],
    is_preset: true,
  },
];
