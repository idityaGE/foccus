import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { useTimerStore } from "@/stores/timerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTimerEvents } from "@/hooks/useTimerEvents";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAutoHide } from "@/hooks/useAutoHide";
import FlipClock from "@/components/FlipClock/FlipClock";
import Overlay from "@/components/Overlay/Overlay";
import Settings from "@/components/Settings/Settings";
import SessionEditor from "@/components/SessionEditor/SessionEditor";
import MiniMode from "@/components/MiniMode/MiniMode";
import TitleBar from "@/components/TitleBar/TitleBar";
import SegmentDots from "@/components/SegmentDots/SegmentDots";

const MINI_WIDTH = 260;
const MINI_HEIGHT = 48;
const NORMAL_WIDTH = 800;
const NORMAL_HEIGHT = 500;

function App() {
  useTimerEvents();
  useKeyboardShortcuts();

  const overlay = useAutoHide(3000);

  const remainingSecs = useTimerStore((s) => s.remainingSecs);
  const segmentLabel = useTimerStore((s) => s.segmentLabel);
  const status = useTimerStore((s) => s.status);
  const miniMode = useTimerStore((s) => s.miniMode);
  const sessions = useTimerStore((s) => s.sessions);
  const activeSessionIndex = useTimerStore((s) => s.activeSessionIndex);
  const showClock = useSettingsStore((s) => s.settings.show_clock);
  const settingsOpen = useSettingsStore((s) => s.settingsOpen);
  const sessionEditorOpen = useSettingsStore((s) => s.sessionEditorOpen);

  const [currentTime, setCurrentTime] = useState("");

  // Only toggle overlay if no dialogs are open
  const handleBackgroundClick = () => {
    if (!settingsOpen && !sessionEditorOpen) {
      overlay.toggle();
    }
  };

  // Real-time clock
  useEffect(() => {
    if (!showClock) return;
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [showClock]);

  // Handle mini mode window resize
  useEffect(() => {
    const win = getCurrentWindow();
    const apply = async () => {
      if (miniMode) {
        await win.setResizable(true);
        await win.setMinSize(new LogicalSize(MINI_WIDTH, MINI_HEIGHT));
        await win.setSize(new LogicalSize(MINI_WIDTH, MINI_HEIGHT));
        await win.setResizable(false);
      } else {
        await win.setResizable(true);
        await win.setMinSize(new LogicalSize(400, 300));
        await win.setSize(new LogicalSize(NORMAL_WIDTH, NORMAL_HEIGHT));
      }
    };
    apply();
  }, [miniMode]);

  // Display time: if stopped, show the first segment duration of active session
  const displaySecs =
    status === "Stopped"
      ? (sessions[activeSessionIndex]?.segments[0]?.duration_secs ?? 0)
      : remainingSecs;

  // Label: only show Study/Break when running, nothing when stopped
  const displayLabel = status === "Stopped" ? "" : segmentLabel;

  if (miniMode) {
    return <MiniMode />;
  }

  return (
    <div
      className="relative w-full h-full flex items-center justify-center bg-[#1a1a1a] select-none"
      onClick={handleBackgroundClick}
    >
      {/* Title Bar (auto-hide, drag region) */}
      <TitleBar />

      {/* Segment progress dots */}
      <SegmentDots />

      {/* Real-time clock */}
      {showClock && (
        <div className="absolute top-3 right-4 z-20 text-xs text-muted-foreground font-mono tabular-nums">
          {currentTime}
        </div>
      )}

      {/* Flip Clock */}
      <FlipClock remainingSecs={displaySecs} label={displayLabel} />

      {/* Controls Overlay */}
      <Overlay visible={overlay.visible} onInteraction={overlay.resetTimer} />

      {/* Settings Modal */}
      <Settings />

      {/* Session Editor Modal */}
      <SessionEditor />
    </div>
  );
}

export default App;
