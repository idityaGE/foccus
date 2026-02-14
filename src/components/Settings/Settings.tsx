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
    value: SettingsType[K],
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
      <DialogContent className="sm:max-w-sm bg-neutral-900 border-neutral-800">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Notifications */}
          <SettingRow
            label="Notifications"
            description="Show notifications on segment end"
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
            <SettingRow label="Volume">
              <Slider
                value={[settings.volume]}
                onValueChange={([v]) => handleChange("volume", v)}
                min={0}
                max={1}
                step={0.05}
                className="w-24"
              />
            </SettingRow>
          )}

          {/* Auto-start next */}
          <SettingRow
            label="Auto-start next"
            description="Start next segment automatically"
          >
            <Switch
              checked={settings.auto_start_next}
              onCheckedChange={(v) => handleChange("auto_start_next", v)}
            />
          </SettingRow>

          <Separator className="bg-neutral-800" />

          {/* Keyboard shortcuts */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-neutral-300">
              Keyboard Shortcuts
            </p>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <Kbd>Space</Kbd>
              <span className="text-neutral-400">Start / Pause</span>
              <Kbd>S</Kbd>
              <span className="text-neutral-400">Skip segment</span>
              <Kbd>Esc</Kbd>
              <span className="text-neutral-400">Stop timer</span>
              <Kbd>F</Kbd>
              <span className="text-neutral-400">Fullscreen</span>
              <Kbd>M</Kbd>
              <span className="text-neutral-400">Mini mode</span>
              <Kbd>P</Kbd>
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
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-neutral-200">{label}</p>
        {description && (
          <p className="text-xs text-neutral-500">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-neutral-800 px-1.5 text-xs font-medium text-neutral-400">
      {children}
    </kbd>
  );
}
