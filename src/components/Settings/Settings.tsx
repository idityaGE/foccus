import { useSettingsStore } from "@/stores/settingsStore";
import { saveSettings, setVolume } from "@/lib/commands";
import type { Settings as SettingsType } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const settingsOpen = useSettingsStore((s) => s.settingsOpen);
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);

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
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-neutral-200">
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Notifications */}
          <SettingRow
            label="Notifications"
            description="Show system notifications on segment end"
          >
            <Switch
              checked={settings.notification_enabled}
              onCheckedChange={(v) => handleChange("notification_enabled", v)}
            />
          </SettingRow>

          {/* Sound */}
          <SettingRow
            label="Sound"
            description="Play sound on segment end"
          >
            <Switch
              checked={settings.sound_enabled}
              onCheckedChange={(v) => handleChange("sound_enabled", v)}
            />
          </SettingRow>

          {/* Volume */}
          {settings.sound_enabled && (
            <SettingRow label="Volume" description="">
              <Slider
                value={[settings.volume]}
                onValueChange={([v]) => handleChange("volume", v)}
                min={0}
                max={1}
                step={0.05}
                className="w-28"
              />
            </SettingRow>
          )}

          {/* Auto-start next */}
          <SettingRow
            label="Auto-start next"
            description="Automatically start the next segment"
          >
            <Switch
              checked={settings.auto_start_next}
              onCheckedChange={(v) => handleChange("auto_start_next", v)}
            />
          </SettingRow>

          <Separator className="bg-neutral-800" />

          {/* Keyboard shortcuts */}
          <div>
            <p className="text-xs font-medium text-neutral-400 mb-3">
              Keyboard Shortcuts
            </p>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <kbd className="text-neutral-500">Space</kbd>
              <span className="text-neutral-400">Start / Pause</span>
              <kbd className="text-neutral-500">S</kbd>
              <span className="text-neutral-400">Skip segment</span>
              <kbd className="text-neutral-500">Esc</kbd>
              <span className="text-neutral-400">Stop timer</span>
              <kbd className="text-neutral-500">F / F11</kbd>
              <span className="text-neutral-400">Fullscreen</span>
              <kbd className="text-neutral-500">M</kbd>
              <span className="text-neutral-400">Mini mode</span>
              <kbd className="text-neutral-500">P</kbd>
              <span className="text-neutral-400">Pin on top</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
