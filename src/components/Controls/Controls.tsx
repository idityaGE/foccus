import { useTimerStore } from "@/stores/timerStore";
import {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  skipSegment,
} from "@/lib/commands";
import { Button } from "@/components/ui/button";
import { SkipForward, Play, Pause, Square } from "lucide-react";

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
      <Button
        variant="secondary"
        className="rounded-full px-5 py-2.5 gap-2 bg-neutral-800 text-neutral-400
          hover:bg-neutral-700 hover:text-neutral-200 disabled:opacity-20"
        onClick={handleSkip}
        disabled={status === "Stopped"}
        title="Skip (S)"
      >
        <SkipForward className="h-3.5 w-3.5" />
        Skip
      </Button>

      {/* Start / Pause */}
      <Button
        variant="secondary"
        className="rounded-full px-7 py-2.5 gap-2 bg-neutral-700 text-neutral-200
          hover:bg-neutral-600 hover:text-white"
        onClick={handleStartPause}
        title={`${startPauseLabel} (Space)`}
      >
        {status === "Running" ? (
          <Pause className="h-3.5 w-3.5" />
        ) : (
          <Play className="h-3.5 w-3.5" />
        )}
        {startPauseLabel}
      </Button>

      {/* Stop */}
      <Button
        variant="secondary"
        className="rounded-full px-5 py-2.5 gap-2 bg-neutral-800 text-neutral-400
          hover:bg-neutral-700 hover:text-neutral-200 disabled:opacity-20"
        onClick={handleStop}
        disabled={status === "Stopped"}
        title="Stop (Esc)"
      >
        <Square className="h-3.5 w-3.5" />
        Stop
      </Button>
    </div>
  );
}
