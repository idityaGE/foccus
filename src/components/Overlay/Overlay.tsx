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
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Maximize,
  ListMusic,
  Settings,
  Pin,
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
      className={`absolute inset-0 z-30
        transition-opacity duration-300
        ${visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        bg-black/40 backdrop-blur-[2px]`}
      onClick={onInteraction}
    >
      {/* Bottom bar: menu (left) | controls (center) | fullscreen (right) */}
      <div
        className="absolute bottom-4 left-4 right-4 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bottom-left: Dropdown menu */}
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
            <DropdownMenuCheckboxItem
              checked={settings.always_on_top}
              onCheckedChange={toggleAlwaysOnTop}
            >
              <Pin className="mr-2 h-4 w-4" />
              Pin on Top
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={settings.show_clock}
              onCheckedChange={toggleClock}
            >
              <Clock className="mr-2 h-4 w-4" />
              Show Clock
            </DropdownMenuCheckboxItem>
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
