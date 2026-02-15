import { useTimerStore } from "@/stores/timerStore";

export default function SegmentDots() {
  const status = useTimerStore((s) => s.status);
  const sessions = useTimerStore((s) => s.sessions);
  const activeSessionIndex = useTimerStore((s) => s.activeSessionIndex);
  const currentSegment = useTimerStore((s) => s.currentSegment);
  const totalSegments = useTimerStore((s) => s.totalSegments);

  const activeSession = sessions[activeSessionIndex];
  const segments = activeSession?.segments ?? [];
  const dotCount = status !== "Stopped" ? totalSegments : segments.length;

  if (dotCount <= 0) return null;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
      {Array.from({ length: dotCount }).map((_, i) => {
        const isActive = status !== "Stopped" ? i === currentSegment : i === 0;
        const isCompleted = status !== "Stopped" && i < currentSegment;
        return (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              isActive
                ? "bg-neutral-300 h-[5px] w-5"
                : isCompleted
                  ? "bg-neutral-500 h-[5px] w-[5px]"
                  : "bg-neutral-700 h-[5px] w-[5px]"
            }`}
          />
        );
      })}
    </div>
  );
}
