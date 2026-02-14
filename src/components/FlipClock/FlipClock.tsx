import FlipDigit from "./FlipDigit";
import "./FlipClock.css";
import { useTimerStore } from "../../stores/timerStore";

interface FlipClockProps {
  remainingSecs: number;
  label: string;
}

export default function FlipClock({ remainingSecs, label }: FlipClockProps) {
  const minutes = Math.floor(remainingSecs / 60);
  const seconds = remainingSecs % 60;

  const m1 = String(Math.floor(minutes / 10));
  const m2 = String(minutes % 10);
  const s1 = String(Math.floor(seconds / 10));
  const s2 = String(seconds % 10);

  const currentSegment = useTimerStore((s) => s.currentSegment);
  const totalSegments = useTimerStore((s) => s.totalSegments);
  const status = useTimerStore((s) => s.status);
  const sessions = useTimerStore((s) => s.sessions);
  const activeSessionIndex = useTimerStore((s) => s.activeSessionIndex);

  // Build segment dots from active session data
  const activeSession = sessions[activeSessionIndex];
  const segments = activeSession?.segments ?? [];
  const dotCount = status !== "Stopped" ? totalSegments : segments.length;

  return (
    <div className="flip-clock-wrapper">
      {/* Segment progress dots */}
      {dotCount > 0 && (
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: dotCount }).map((_, i) => {
            const isActive =
              status !== "Stopped" ? i === currentSegment : i === 0;
            return (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-neutral-300 h-[5px] w-5"
                    : i < (status !== "Stopped" ? currentSegment : 0)
                    ? "bg-neutral-500 h-[5px] w-[5px]"
                    : "bg-neutral-700 h-[5px] w-[5px]"
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Clock digits */}
      <div className="flip-clock">
        <div className="flip-clock__group">
          <FlipDigit digit={m1} />
          <FlipDigit digit={m2} />
        </div>

        <div className="flip-clock__colon">
          <div className="flip-clock__colon-dot" />
          <div className="flip-clock__colon-dot" />
        </div>

        <div className="flip-clock__group">
          <FlipDigit digit={s1} />
          <FlipDigit digit={s2} />
        </div>
      </div>

      {/* Segment label below clock */}
      <div className="text-sm font-medium tracking-[0.3em] uppercase text-neutral-500 text-center">
        {status === "Stopped" ? "" : label}
      </div>
    </div>
  );
}
