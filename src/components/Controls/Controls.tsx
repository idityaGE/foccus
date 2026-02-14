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
      // Stopped - start new session
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

  return (
    <div className="flex items-center gap-4">
      {/* Skip */}
      <button
        onClick={handleSkip}
        disabled={status === "Stopped"}
        className="w-10 h-10 flex items-center justify-center rounded-full
          text-neutral-400 hover:text-white hover:bg-neutral-700/50
          disabled:opacity-30 disabled:cursor-not-allowed
          transition-all duration-200"
        title="Skip (S)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4l12 8-12 8V4zm14 0v16h-2V4h2z" />
        </svg>
      </button>

      {/* Start / Pause */}
      <button
        onClick={handleStartPause}
        className="w-14 h-14 flex items-center justify-center rounded-full
          bg-neutral-700/60 hover:bg-neutral-600/80
          text-white transition-all duration-200
          hover:scale-105 active:scale-95"
        title={
          status === "Running"
            ? "Pause (Space)"
            : status === "Paused"
            ? "Resume (Space)"
            : "Start (Space)"
        }
      >
        {status === "Running" ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Stop */}
      <button
        onClick={handleStop}
        disabled={status === "Stopped"}
        className="w-10 h-10 flex items-center justify-center rounded-full
          text-neutral-400 hover:text-white hover:bg-neutral-700/50
          disabled:opacity-30 disabled:cursor-not-allowed
          transition-all duration-200"
        title="Stop (Esc)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      </button>
    </div>
  );
}
