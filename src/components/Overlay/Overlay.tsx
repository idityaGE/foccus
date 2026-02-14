import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSettingsStore } from "../../stores/settingsStore";
import { useTimerStore } from "../../stores/timerStore";
import { saveSettings } from "../../lib/commands";
import Controls from "../Controls/Controls";

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

  const iconBtnBase =
    "w-9 h-9 flex items-center justify-center rounded-xl transition-colors";
  const iconBtnOff =
    "bg-neutral-800/70 text-neutral-400 hover:bg-neutral-700/80 hover:text-neutral-200";
  const iconBtnOn = "bg-neutral-600/80 text-white";

  return (
    <div
      className={`absolute inset-0 z-30 flex flex-col items-center
        transition-opacity duration-300
        ${visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        bg-black/40 backdrop-blur-[2px]`}
      onClick={onInteraction}
    >
      {/* Top row - utility buttons */}
      <div
        className="flex items-center gap-2 w-full justify-end px-4 py-3 m-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sessions */}
        <button
          onClick={() => { setSessionEditorOpen(true); onInteraction(); }}
          className="h-9 flex items-center gap-2 px-4 rounded-xl
            text-xs text-neutral-300 bg-neutral-800/70 hover:bg-neutral-700/80
            transition-colors"
          title="Sessions"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
          </svg>
          Sessions
        </button>

        {/* Settings - icon only */}
        <button
          onClick={() => { setSettingsOpen(true); onInteraction(); }}
          className={`${iconBtnBase} ${iconBtnOff}`}
          title="Settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        {/* Pin (Always on top) */}
        <button
          onClick={toggleAlwaysOnTop}
          className={`${iconBtnBase} ${settings.always_on_top ? iconBtnOn : iconBtnOff}`}
          title={`Pin ${settings.always_on_top ? "(on)" : "(off)"} [P]`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
          </svg>
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className={`${iconBtnBase} ${iconBtnOff}`}
          title="Fullscreen [F]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" strokeLinecap="round" />
          </svg>
        </button>

        {/* Clock toggle */}
        <button
          onClick={toggleClock}
          className={`${iconBtnBase} ${settings.show_clock ? iconBtnOn : iconBtnOff}`}
          title={`Clock ${settings.show_clock ? "(on)" : "(off)"}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Mini mode */}
        <button
          onClick={() => { setMiniMode(!miniMode); onInteraction(); }}
          className={`${iconBtnBase} ${miniMode ? iconBtnOn : iconBtnOff}`}
          title="Mini mode [M]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="8" width="16" height="8" rx="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Flexible spacer */}
      <div className="flex-1" />

      {/* Bottom area - controls */}
      <div
        className="flex flex-col items-center pb-[10%]"
        onClick={(e) => e.stopPropagation()}
      >
        <Controls />
      </div>
    </div>
  );
}
