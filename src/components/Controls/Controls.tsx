import { useTimerStore } from "../../stores/timerStore";
import {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  skipSegment,
} from "../../lib/commands";

export default function Controls() {
  const status = useTimerStore((s) => s.status);
  const sessions = useTimerStore((s) => s.sessions);
  const activeSessionIndex = useTimerStore((s) => s.activeSessionIndex);

  const handleStartPause = async () => {
    if (status === "Running") {
      await pauseTimer();
    } else if (status === "Paused") {
      await resumeTimer();
    } else {
      const session = sessions[activeSessionIndex];
      if (session) {
        await startTimer(session.segments);
      }
    }
  };

  const handleStop = async () => {
    await stopTimer();
  };

  const handleSkip = async () => {
    if (status !== "Stopped") {
      await skipSegment();
    }
  };

  const startPauseLabel =
    status === "Running" ? "Pause" : status === "Paused" ? "Resume" : "Start";

  return (
    <div className="flex items-center gap-3">
      {/* Skip */}
      <button
        onClick={handleSkip}
        disabled={status === "Stopped"}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full
          border border-neutral-700 bg-transparent
          text-sm text-neutral-300 hover:text-white hover:border-neutral-500 hover:bg-neutral-800/50
          disabled:opacity-30 disabled:cursor-not-allowed
          transition-all duration-200 active:scale-95"
        title="Skip (S)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4l12 8-12 8V4zm14 0v16h-2V4h2z" />
        </svg>
        Skip
      </button>

      {/* Start / Pause */}
      <button
        onClick={handleStartPause}
        className="flex items-center gap-2 px-7 py-2.5 rounded-full
          border border-neutral-600 bg-neutral-800/80
          text-sm text-neutral-200 hover:text-white hover:border-neutral-400 hover:bg-neutral-700/80
          transition-all duration-200 active:scale-95"
        title={`${startPauseLabel} (Space)`}
      >
        {status === "Running" ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
        {startPauseLabel}
      </button>

      {/* Stop */}
      <button
        onClick={handleStop}
        disabled={status === "Stopped"}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full
          border border-neutral-700 bg-transparent
          text-sm text-neutral-300 hover:text-white hover:border-neutral-500 hover:bg-neutral-800/50
          disabled:opacity-30 disabled:cursor-not-allowed
          transition-all duration-200 active:scale-95"
        title="Stop (Esc)"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
        Stop
      </button>
    </div>
  );
}
