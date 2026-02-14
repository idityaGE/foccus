import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { useTimerStore } from "./stores/timerStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useTimerEvents } from "./hooks/useTimerEvents";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useAutoHide } from "./hooks/useAutoHide";
import FlipClock from "./components/FlipClock/FlipClock";
import TitleBar from "./components/TitleBar/TitleBar";
import Overlay from "./components/Overlay/Overlay";
import Settings from "./components/Settings/Settings";
import SessionEditor from "./components/SessionEditor/SessionEditor";
import MiniMode from "./components/MiniMode/MiniMode";

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

  const [currentTime, setCurrentTime] = useState("");

  // Real-time clock
  useEffect(() => {
    if (!showClock) return;
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [showClock]);

  // Handle mini mode window resize
  useEffect(() => {
    const win = getCurrentWindow();
    if (miniMode) {
      win.setSize(new LogicalSize(MINI_WIDTH, MINI_HEIGHT));
      win.setMinSize(new LogicalSize(MINI_WIDTH, MINI_HEIGHT));
      win.setResizable(false);
    } else {
      win.setMinSize(new LogicalSize(400, 300));
      win.setSize(new LogicalSize(NORMAL_WIDTH, NORMAL_HEIGHT));
      win.setResizable(true);
    }
  }, [miniMode]);

  // Display time: if stopped, show the first segment duration of active session
  const displaySecs =
    status === "Stopped"
      ? sessions[activeSessionIndex]?.segments[0]?.duration_secs ?? 0
      : remainingSecs;

  // Label: only show Study/Break when running, nothing when stopped
  const displayLabel =
    status === "Stopped" ? "" : segmentLabel;

  if (miniMode) {
    return <MiniMode />;
  }

  return (
    <div
      className="relative w-full h-full flex items-center justify-center bg-[#1a1a1a] select-none"
      onClick={overlay.toggle}
    >
      {/* Title Bar */}
      <TitleBar />

      {/* Real-time clock */}
      {showClock && (
        <div className="absolute top-3 right-4 z-20 text-xs text-neutral-500 font-mono tabular-nums">
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
