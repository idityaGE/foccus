import { useTimerStore } from "@/stores/timerStore";

export default function SessionIndicator() {
  const currentSegment = useTimerStore((s) => s.currentSegment);
  const totalSegments = useTimerStore((s) => s.totalSegments);
  const status = useTimerStore((s) => s.status);

  if (status === "Stopped" || totalSegments === 0) return null;

  return (
    <div className="text-xs text-neutral-500 font-medium tabular-nums">
      {currentSegment + 1}/{totalSegments}
    </div>
  );
}
