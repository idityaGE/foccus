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
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Skip */}
      <Button
        variant="secondary"
        className="h-auto rounded-full px-3 py-2 sm:px-5 sm:py-2.5 gap-1.5 sm:gap-2"
        onClick={handleSkip}
        disabled={status === "Stopped"}
        title="Skip (S)"
      >
        <SkipForward className="size-4" />
        <span className="hidden sm:inline">Skip</span>
      </Button>

      {/* Start / Pause */}
      <Button
        variant="secondary"
        className="h-auto rounded-full px-3 py-2 sm:px-5 sm:py-2.5 gap-1.5 sm:gap-2 bg-neutral-700 hover:bg-neutral-600"
        onClick={handleStartPause}
        title={`${startPauseLabel} (Space)`}
      >
        {status === "Running" ? <Pause className="size-4" /> : <Play className="size-4" />}
        <span className="hidden sm:inline">{startPauseLabel}</span>
      </Button>

      {/* Stop */}
      <Button
        variant="secondary"
        className="h-auto rounded-full px-3 py-2 sm:px-5 sm:py-2.5 gap-1.5 sm:gap-2"
        onClick={handleStop}
        disabled={status === "Stopped"}
        title="Stop (Esc)"
      >
        <Square className="size-4" />
        <span className="hidden sm:inline">Stop</span>
      </Button>
    </div>
  );
}
