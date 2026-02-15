import { useState, useEffect, useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";

export default function TitleBar() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Show on mouse near top edge
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (e.clientY <= 6) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Auto-hide after 2s if not hovered
  useEffect(() => {
    if (visible && !hovered) {
      const t = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(t);
    }
  }, [visible, hovered]);

  const win = getCurrentWindow();

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setTimeout(() => setVisible(false), 800);
      }}
    >
      <div
        className="flex items-center justify-between h-9 px-3 bg-neutral-900/90 backdrop-blur-sm border-b border-neutral-800"
        data-tauri-drag-region
      >
        <span
          className="text-xs font-medium text-neutral-400 pointer-events-none"
          data-tauri-drag-region
        >
          Foccus
        </span>

        <div className="flex items-center gap-1">
          {/* Minimize */}
          <button
            onClick={() => win.minimize()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-700/60 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize */}
          <button
            onClick={() => win.toggleMaximize()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-700/60 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>

          {/* Close (hides to tray) */}
          <button
            onClick={() => win.hide()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/80 text-neutral-400 hover:text-white transition-colors"
            title="Close to tray"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
