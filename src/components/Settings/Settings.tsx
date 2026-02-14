import { useSettingsStore } from "../../stores/settingsStore";
import { saveSettings, setVolume } from "../../lib/commands";
import type { Settings as SettingsType } from "../../lib/types";

export default function Settings() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const settingsOpen = useSettingsStore((s) => s.settingsOpen);
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);

  if (!settingsOpen) return null;

  const handleChange = async <K extends keyof SettingsType>(
    key: K,
    value: SettingsType[K]
  ) => {
    updateSetting(key, value);
    const updated = { ...settings, [key]: value };
    await saveSettings(updated);

    if (key === "volume") {
      await setVolume(value as number);
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md mx-4 bg-neutral-900 border border-neutral-800 rounded-2xl
          shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-200">Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg
              text-neutral-400 hover:text-white hover:bg-neutral-700/60 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Settings list */}
        <div className="px-6 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Notifications */}
          <SettingRow
            label="Notifications"
            description="Show system notifications on segment end"
          >
            <Toggle
              value={settings.notification_enabled}
              onChange={(v) => handleChange("notification_enabled", v)}
            />
          </SettingRow>

          {/* Sound */}
          <SettingRow
            label="Sound"
            description="Play sound on segment end"
          >
            <Toggle
              value={settings.sound_enabled}
              onChange={(v) => handleChange("sound_enabled", v)}
            />
          </SettingRow>

          {/* Volume */}
          {settings.sound_enabled && (
            <SettingRow label="Volume" description="">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) =>
                  handleChange("volume", parseFloat(e.target.value))
                }
                className="w-28 accent-neutral-400"
              />
            </SettingRow>
          )}

          {/* Auto-start next segment */}
          <SettingRow
            label="Auto-start next"
            description="Automatically start the next segment"
          >
            <Toggle
              value={settings.auto_start_next}
              onChange={(v) => handleChange("auto_start_next", v)}
            />
          </SettingRow>

          {/* Keyboard shortcuts reference */}
          <div className="pt-3 border-t border-neutral-800">
            <p className="text-xs font-medium text-neutral-400 mb-3">Keyboard Shortcuts</p>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-neutral-500">
              <span>Space</span><span className="text-neutral-400">Start / Pause</span>
              <span>S</span><span className="text-neutral-400">Skip segment</span>
              <span>Esc</span><span className="text-neutral-400">Stop timer</span>
              <span>F / F11</span><span className="text-neutral-400">Fullscreen</span>
              <span>M</span><span className="text-neutral-400">Mini mode</span>
              <span>P</span><span className="text-neutral-400">Pin on top</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-neutral-200">{label}</p>
        {description && (
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
        value ? "bg-neutral-500" : "bg-neutral-700"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
