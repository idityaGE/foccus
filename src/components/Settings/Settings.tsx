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
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldSeparator,
} from "@/components/ui/field";

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
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 z-50">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-neutral-200">
            Settings
          </DialogTitle>
        </DialogHeader>

        <FieldGroup className="gap-5 py-2">
          {/* Notifications */}
          <Field orientation="horizontal">
            <FieldLabel className="flex-col items-start gap-0.5">
              Notifications
              <FieldDescription className="text-xs">
                Show system notifications on segment end
              </FieldDescription>
            </FieldLabel>
            <Switch
              checked={settings.notification_enabled}
              onCheckedChange={(v) => handleChange("notification_enabled", v)}
            />
          </Field>

          {/* Sound */}
          <Field orientation="horizontal">
            <FieldLabel className="flex-col items-start gap-0.5">
              Sound
              <FieldDescription className="text-xs">
                Play sound on segment end
              </FieldDescription>
            </FieldLabel>
            <Switch
              checked={settings.sound_enabled}
              onCheckedChange={(v) => handleChange("sound_enabled", v)}
            />
          </Field>

          {/* Volume */}
          {settings.sound_enabled && (
            <Field orientation="horizontal">
              <FieldLabel>Volume</FieldLabel>
              <Slider
                value={[settings.volume]}
                onValueChange={([v]) => handleChange("volume", v)}
                min={0}
                max={1}
                step={0.05}
                className="w-28"
              />
            </Field>
          )}

          {/* Auto-start next */}
          <Field orientation="horizontal">
            <FieldLabel className="flex-col items-start gap-0.5">
              Auto-start next
              <FieldDescription className="text-xs">
                Automatically start the next segment
              </FieldDescription>
            </FieldLabel>
            <Switch
              checked={settings.auto_start_next}
              onCheckedChange={(v) => handleChange("auto_start_next", v)}
            />
          </Field>

          <FieldSeparator />

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
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}
