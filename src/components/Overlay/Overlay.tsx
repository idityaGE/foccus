import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSettingsStore } from "../../stores/settingsStore";
import { useTimerStore } from "../../stores/timerStore";
import { saveSettings } from "../../lib/commands";
import Controls from "../Controls/Controls";
import SessionIndicator from "../SessionIndicator/SessionIndicator";

interface OverlayProps {
  visible: boolean;
  onInteraction: () => void;
}

export default function Overlay({ visible, onInteraction }: OverlayProps) {
  const settings = useSettingsStore((s) => s.settings);
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);
  const setSessionEditorOpen = useSettingsStore((s) => s.setSessionEditorOpen);
  const miniMode = useTimerStore((s) => s.miniMode);
  const setMiniMode = useTimerStore((s) => s.setMiniMode);

  const win = getCurrentWindow();

  const toggleAlwaysOnTop = async () => {
    const newVal = !settings.always_on_top;
    await win.setAlwaysOnTop(newVal);
    updateSetting("always_on_top", newVal);
    const updated = { ...settings, always_on_top: newVal };
    await saveSettings(updated);
    onInteraction();
  };

  const toggleFullscreen = async () => {
    const isFull = await win.isFullscreen();
    await win.setFullscreen(!isFull);
    onInteraction();
  };

  const toggleClock = async () => {
    const newVal = !settings.show_clock;
    updateSetting("show_clock", newVal);
    const updated = { ...settings, show_clock: newVal };
    await saveSettings(updated);
    onInteraction();
  };

  return (
    <div
      className={`absolute inset-0 z-30 flex flex-col items-center justify-between
        py-14 px-6 transition-opacity duration-300
        ${visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        bg-black/40 backdrop-blur-[2px]`}
      onClick={onInteraction}
    >
      {/* Top row - utility buttons */}
      <div
        className="flex items-center gap-3 w-full justify-end"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sessions */}
        <button
          onClick={() => { setSessionEditorOpen(true); onInteraction(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            text-xs text-neutral-300 bg-neutral-800/70 hover:bg-neutral-700/80
            transition-colors"
          title="Sessions"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
          </svg>
          Sessions
        </button>

        {/* Settings */}
        <button
          onClick={() => { setSettingsOpen(true); onInteraction(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            text-xs text-neutral-300 bg-neutral-800/70 hover:bg-neutral-700/80
            transition-colors"
          title="Settings"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          Settings
        </button>

        {/* Pin (Always on top) */}
        <button
          onClick={toggleAlwaysOnTop}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors
            ${settings.always_on_top
              ? "bg-neutral-600/80 text-white"
              : "bg-neutral-800/70 text-neutral-400 hover:bg-neutral-700/80 hover:text-neutral-200"
            }`}
          title={`Pin ${settings.always_on_top ? "(on)" : "(off)"} [P]`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
          </svg>
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="w-8 h-8 flex items-center justify-center rounded-lg
            bg-neutral-800/70 text-neutral-400 hover:bg-neutral-700/80 hover:text-neutral-200
            transition-colors"
          title="Fullscreen [F]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" strokeLinecap="round" />
          </svg>
        </button>

        {/* Clock toggle */}
        <button
          onClick={toggleClock}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors
            ${settings.show_clock
              ? "bg-neutral-600/80 text-white"
              : "bg-neutral-800/70 text-neutral-400 hover:bg-neutral-700/80 hover:text-neutral-200"
            }`}
          title={`Clock ${settings.show_clock ? "(on)" : "(off)"}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Mini mode */}
        <button
          onClick={() => { setMiniMode(!miniMode); onInteraction(); }}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors
            ${miniMode
              ? "bg-neutral-600/80 text-white"
              : "bg-neutral-800/70 text-neutral-400 hover:bg-neutral-700/80 hover:text-neutral-200"
            }`}
          title={`Mini mode [M]`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="8" width="16" height="8" rx="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Center spacer */}
      <div />

      {/* Bottom row - main controls */}
      <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <SessionIndicator />
        <Controls />
      </div>
    </div>
  );
}
