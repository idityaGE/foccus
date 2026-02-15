import FlipDigit from "./FlipDigit";
import "./FlipClock.css";
import { useTimerStore } from "@/stores/timerStore";

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

  const status = useTimerStore((s) => s.status);

  return (
    <div className="flip-clock-wrapper">
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
