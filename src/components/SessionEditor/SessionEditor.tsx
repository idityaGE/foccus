import { useState } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  saveSessions,
  setActiveSessionIndex as setActiveSessionCmd,
} from "@/lib/commands";
import type { Session, Segment } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Pencil, Trash2, Plus, X } from "lucide-react";

export default function SessionEditor() {
  const sessions = useTimerStore((s) => s.sessions);
  const setSessions = useTimerStore((s) => s.setSessions);
  const activeSessionIndex = useTimerStore((s) => s.activeSessionIndex);
  const setActiveSessionIndex = useTimerStore((s) => s.setActiveSessionIndex);
  const sessionEditorOpen = useSettingsStore((s) => s.sessionEditorOpen);
  const setSessionEditorOpen = useSettingsStore((s) => s.setSessionEditorOpen);

  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSelect = async (index: number) => {
    setActiveSessionIndex(index);
    await setActiveSessionCmd(index);
  };

  const handleDelete = async (index: number) => {
    const updated = sessions.filter((_, i) => i !== index);
    setSessions(updated);
    await saveSessions(updated);
    if (activeSessionIndex >= updated.length) {
      const newIdx = Math.max(0, updated.length - 1);
      setActiveSessionIndex(newIdx);
      await setActiveSessionCmd(newIdx);
    }
  };

  const handleSaveSession = async (session: Session) => {
    let updated: Session[];
    if (editingIndex !== null) {
      updated = sessions.map((s, i) => (i === editingIndex ? session : s));
    } else {
      updated = [...sessions, session];
    }
    setSessions(updated);
    await saveSessions(updated);
    setEditingSession(null);
    setEditingIndex(null);
  };

  const startNewSession = () => {
    setEditingSession({
      name: "",
      segments: [{ label: "Study", duration_secs: 1500 }],
      is_preset: false,
    });
    setEditingIndex(null);
  };

  const startEdit = (index: number) => {
    setEditingSession({
      ...sessions[index],
      segments: [...sessions[index].segments],
    });
    setEditingIndex(index);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditingSession(null);
      setEditingIndex(null);
    }
    setSessionEditorOpen(open);
  };

  const title = editingSession
    ? editingIndex !== null
      ? "Edit Session"
      : "New Session"
    : "Sessions";

  return (
    <Dialog open={sessionEditorOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-neutral-900 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-neutral-200">
            {title}
          </DialogTitle>
        </DialogHeader>

        {editingSession ? (
          <SessionForm
            session={editingSession}
            onSave={handleSaveSession}
            onCancel={() => {
              setEditingSession(null);
              setEditingIndex(null);
            }}
          />
        ) : (
          <div className="space-y-4">
            <ScrollArea className="max-h-[50vh]">
              <RadioGroup
                value={String(activeSessionIndex)}
                onValueChange={(v) => handleSelect(Number(v))}
                className="gap-2 pr-2"
              >
                {sessions.map((session, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-neutral-800/50 p-3 hover:bg-neutral-800 transition-colors"
                  >
                    <RadioGroupItem
                      value={String(i)}
                      id={`session-${i}`}
                      className="shrink-0"
                    />
                    <Label
                      htmlFor={`session-${i}`}
                      className="flex-1 cursor-pointer"
                    >
                      <p className="text-sm font-medium text-neutral-200">
                        {session.name}
                        {session.is_preset && (
                          <span className="ml-2 text-[10px] text-neutral-500 uppercase">
                            preset
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {session.segments.length} segments &middot;{" "}
                        {formatTotalTime(session.segments)}
                      </p>
                    </Label>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-neutral-500 hover:text-neutral-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(i);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {!session.is_preset && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-neutral-500 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(i);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </ScrollArea>

            <Button
              variant="outline"
              className="w-full border-dashed border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-500"
              onClick={startNewSession}
            >
              <Plus className="h-4 w-4" />
              New Session
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SessionForm({
  session,
  onSave,
  onCancel,
}: {
  session: Session;
  onSave: (s: Session) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(session.name);
  const [segments, setSegments] = useState<Segment[]>([...session.segments]);

  const updateSegment = (
    index: number,
    field: keyof Segment,
    value: string | number
  ) => {
    const updated = [...segments];
    if (field === "duration_secs") {
      updated[index] = { ...updated[index], duration_secs: value as number };
    } else {
      updated[index] = { ...updated[index], label: value as string };
    }
    setSegments(updated);
  };

  const addSegment = () => {
    setSegments([...segments, { label: "Study", duration_secs: 1500 }]);
  };

  const removeSegment = (index: number) => {
    if (segments.length > 1) {
      setSegments(segments.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), segments, is_preset: false });
  };

  return (
    <div className="space-y-5">
      {/* Session name */}
      <div className="space-y-2">
        <Label className="text-sm text-neutral-400">Session Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Session"
          className="bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500"
        />
      </div>

      {/* Segments */}
      <div className="space-y-2">
        <Label className="text-sm text-neutral-400">Segments</Label>
        <div className="space-y-2">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <Select
                value={seg.label}
                onValueChange={(v) => updateSegment(i, "label", v)}
              >
                <SelectTrigger className="w-24 bg-neutral-800 border-neutral-700 text-sm text-neutral-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  <SelectItem value="Study">Study</SelectItem>
                  <SelectItem value="Break">Break</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={Math.floor(seg.duration_secs / 60)}
                  onChange={(e) =>
                    updateSegment(
                      i,
                      "duration_secs",
                      parseInt(e.target.value || "1") * 60
                    )
                  }
                  className="w-16 bg-neutral-800 border-neutral-700 text-sm text-neutral-200 text-center"
                />
                <span className="text-sm text-neutral-500">min</span>
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                className="text-neutral-500 hover:text-red-400 shrink-0"
                onClick={() => removeSegment(i)}
                disabled={segments.length <= 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="border-dashed border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-500"
            onClick={addSegment}
          >
            <Plus className="h-4 w-4" />
            Add segment
          </Button>
        </div>
      </div>

      <Separator className="bg-neutral-800" />

      {/* Actions */}
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          Save
        </Button>
      </DialogFooter>
    </div>
  );
}

function formatTotalTime(segments: Segment[]): string {
  const total = segments.reduce((sum, s) => sum + s.duration_secs, 0);
  const mins = Math.floor(total / 60);
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m total`;
  }
  return `${mins}m total`;
}
