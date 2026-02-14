import { useTimerStore } from "@/stores/timerStore";

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MiniMode() {
  const remainingSecs = useTimerStore((s) => s.remainingSecs);
  const segmentLabel = useTimerStore((s) => s.segmentLabel);
  const status = useTimerStore((s) => s.status);
  const setMiniMode = useTimerStore((s) => s.setMiniMode);

  return (
    <div
      className="flex items-center justify-between w-full h-full px-4
        bg-neutral-900 cursor-pointer select-none"
      data-tauri-drag-region
      onDoubleClick={() => setMiniMode(false)}
      title="Double-click to exit mini mode"
    >
      <span
        className="text-xs font-medium tracking-widest uppercase text-neutral-500"
        data-tauri-drag-region
      >
        {status === "Stopped" ? "FOCCUS" : segmentLabel}
      </span>
      <span
        className="text-lg font-bold text-neutral-200 tabular-nums font-mono"
        data-tauri-drag-region
      >
        {status === "Stopped" ? "--:--" : formatTime(remainingSecs)}
      </span>
    </div>
  );
}
