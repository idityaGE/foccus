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
    <div className="flex items-center gap-[clamp(8px,2vw,16px)]">
      {/* Skip */}
      <button
        onClick={handleSkip}
        disabled={status === "Stopped"}
        className="control-btn control-btn--secondary"
        title="Skip (S)"
      >
        <svg className="control-btn__icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4l12 8-12 8V4zm14 0v16h-2V4h2z" />
        </svg>
        <span>Skip</span>
      </button>

      {/* Start / Pause */}
      <button
        onClick={handleStartPause}
        className="control-btn control-btn--primary"
        title={`${startPauseLabel} (Space)`}
      >
        {status === "Running" ? (
          <svg className="control-btn__icon" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="control-btn__icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
        <span>{startPauseLabel}</span>
      </button>

      {/* Stop */}
      <button
        onClick={handleStop}
        disabled={status === "Stopped"}
        className="control-btn control-btn--secondary"
        title="Stop (Esc)"
      >
        <svg className="control-btn__icon" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
        <span>Stop</span>
      </button>
    </div>
  );
}
