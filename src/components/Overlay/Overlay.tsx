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
  PictureInPicture2,
  Pin,
  Clock,
  Monitor,
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

  const toggleFullscreen = async () => {
    const isFull = await win.isFullscreen();
    await win.setFullscreen(!isFull);
    onInteraction();
  };

  // Build toggle values array from settings
  const toggleValues = [
    ...(settings.always_on_top ? ["pin"] : []),
    ...(settings.show_clock ? ["clock"] : []),
    ...(settings.visible_on_all_workspaces ? ["workspaces"] : []),
  ];

  const handleToggleChange = async (values: string[]) => {
    const pinOn = values.includes("pin");
    const clockOn = values.includes("clock");
    const workspacesOn = values.includes("workspaces");

    let newSettings = { ...settings };

    // Update always_on_top
    if (pinOn !== settings.always_on_top) {
      try {
        await win.setAlwaysOnTop(pinOn);
        updateSetting("always_on_top", pinOn);
        newSettings = { ...newSettings, always_on_top: pinOn };
      } catch {
        // Window manager may not support this feature
      }
    }

    // Update show_clock
    if (clockOn !== settings.show_clock) {
      updateSetting("show_clock", clockOn);
      newSettings = { ...newSettings, show_clock: clockOn };
    }

    // Update visible_on_all_workspaces
    if (workspacesOn !== settings.visible_on_all_workspaces) {
      try {
        await win.setVisibleOnAllWorkspaces(workspacesOn);
        updateSetting("visible_on_all_workspaces", workspacesOn);
        newSettings = { ...newSettings, visible_on_all_workspaces: workspacesOn };
      } catch {
        // Window manager may not support this feature
      }
    }

    await saveSettings(newSettings);
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
        className="flex items-end justify-between p-3 sm:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bottom-left: Dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
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
            <DropdownMenuSeparator />
            {/* Window options toggle group */}
            <div className="px-2 py-1.5">
              <ToggleGroup
                type="multiple"
                variant="outline"
                size="sm"
                className="justify-start"
                value={toggleValues}
                onValueChange={handleToggleChange}
              >
                <ToggleGroupItem value="pin" aria-label="Pin on Top" title="Pin on Top">
                  <Pin className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="clock" aria-label="Show Clock" title="Show Clock">
                  <Clock className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="workspaces" aria-label="All Workspaces" title="Visible on All Workspaces">
                  <Monitor className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Bottom-center: Controls */}
        <div className="flex-1 flex justify-center min-w-0">
          <Controls />
        </div>

        {/* Bottom-right: Fullscreen */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={toggleFullscreen}
          title="Fullscreen [F]"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
