import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTimerStore } from "@/stores/timerStore";
import { saveSettings } from "@/lib/commands";
import Controls from "@/components/Controls/Controls";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Menu,
  Maximize,
  ListMusic,
  Settings,
  Pin,
  PinOff,
  Clock,
  PictureInPicture2,
} from "lucide-react";

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
      className={`absolute inset-0 z-30 flex flex-col
        transition-opacity duration-300
        ${visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        bg-black/40 backdrop-blur-[2px]`}
      onClick={onInteraction}
    >
      <div className="flex-1"></div>
      {/* Bottom bar: menu + toggles (left) | controls (center) | fullscreen (right) */}
      <div
        className="flex items-end justify-between p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bottom-left: Dropdown menu + inline toggles */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  setSessionEditorOpen(true);
                  onInteraction();
                }}
              >
                <ListMusic className="mr-2 h-4 w-4" />
                Sessions
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSettingsOpen(true);
                  onInteraction();
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setMiniMode(!miniMode);
                  onInteraction();
                }}
              >
                <PictureInPicture2 className="mr-2 h-4 w-4" />
                Mini Mode
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Inline icon toggles for Pin and Clock */}
          <ToggleGroup
            type="multiple"
            variant="outline"
            size="sm"
            value={[
              ...(settings.always_on_top ? ["pin"] : []),
              ...(settings.show_clock ? ["clock"] : []),
            ]}
            onValueChange={(values) => {
              const pinOn = values.includes("pin");
              const clockOn = values.includes("clock");
              if (pinOn !== settings.always_on_top) toggleAlwaysOnTop();
              if (clockOn !== settings.show_clock) toggleClock();
            }}
          >
            <ToggleGroupItem value="pin" aria-label="Pin on Top" title="Pin on Top">
              {settings.always_on_top ? (
                <Pin className="h-4 w-4" />
              ) : (
                <PinOff className="h-4 w-4" />
              )}
            </ToggleGroupItem>
            <ToggleGroupItem value="clock" aria-label="Show Clock" title="Show Clock">
              <Clock className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Bottom-center: Controls */}
        <div className="flex-1 flex justify-center">
          <Controls />
        </div>

        {/* Bottom-right: Fullscreen */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          title="Fullscreen [F]"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
