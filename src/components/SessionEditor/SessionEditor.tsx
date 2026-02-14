import { useState } from "react";
import { useTimerStore } from "../../stores/timerStore";
import { useSettingsStore } from "../../stores/settingsStore";
import {
  saveSessions,
  setActiveSessionIndex as setActiveSessionCmd,
} from "../../lib/commands";
import type { Session, Segment } from "../../lib/types";

export default function SessionEditor() {
  const sessions = useTimerStore((s) => s.sessions);
  const setSessions = useTimerStore((s) => s.setSessions);
  const activeSessionIndex = useTimerStore((s) => s.activeSessionIndex);
  const setActiveSessionIndex = useTimerStore((s) => s.setActiveSessionIndex);
  const sessionEditorOpen = useSettingsStore((s) => s.sessionEditorOpen);
  const setSessionEditorOpen = useSettingsStore((s) => s.setSessionEditorOpen);

  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  if (!sessionEditorOpen) return null;

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
    setEditingSession({ ...sessions[index], segments: [...sessions[index].segments] });
    setEditingIndex(index);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-lg mx-4 bg-neutral-900 border border-neutral-800 rounded-2xl
          shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-200">
            {editingSession ? (editingIndex !== null ? "Edit Session" : "New Session") : "Sessions"}
          </h2>
          <button
            onClick={() => {
              if (editingSession) {
                setEditingSession(null);
                setEditingIndex(null);
              } else {
                setSessionEditorOpen(false);
              }
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg
              text-neutral-400 hover:text-white hover:bg-neutral-700/60 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {editingSession ? (
            <SessionForm
              session={editingSession}
              onSave={handleSaveSession}
              onCancel={() => { setEditingSession(null); setEditingIndex(null); }}
            />
          ) : (
            <div className="space-y-2">
              {sessions.map((session, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    i === activeSessionIndex
                      ? "bg-neutral-700/50 border border-neutral-600"
                      : "bg-neutral-800/50 border border-transparent hover:bg-neutral-800"
                  }`}
                  onClick={() => handleSelect(i)}
                >
                  <div>
                    <p className="text-sm text-neutral-200 font-medium">
                      {session.name}
                      {session.is_preset && (
                        <span className="ml-2 text-[10px] text-neutral-500 uppercase">preset</span>
                      )}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {session.segments.length} segments &middot;{" "}
                      {formatTotalTime(session.segments)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(i); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg
                        text-neutral-500 hover:text-neutral-200 hover:bg-neutral-700/60 transition-colors"
                      title="Edit"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    {!session.is_preset && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(i); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg
                          text-neutral-500 hover:text-red-400 hover:bg-neutral-700/60 transition-colors"
                        title="Delete"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={startNewSession}
                className="w-full p-3 rounded-xl border border-dashed border-neutral-700
                  text-sm text-neutral-400 hover:text-neutral-200 hover:border-neutral-500
                  transition-colors"
              >
                + New Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
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

  const updateSegment = (index: number, field: keyof Segment, value: string | number) => {
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
    <div className="space-y-4">
      {/* Session name */}
      <div>
        <label className="text-xs text-neutral-400 mb-1 block">Session Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Session"
          className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700
            text-sm text-neutral-200 placeholder-neutral-600
            focus:outline-none focus:border-neutral-500"
        />
      </div>

      {/* Segments */}
      <div>
        <label className="text-xs text-neutral-400 mb-2 block">Segments</label>
        <div className="space-y-2">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={seg.label}
                onChange={(e) => updateSegment(i, "label", e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700
                  text-xs text-neutral-200 focus:outline-none focus:border-neutral-500"
              >
                <option value="Study">Study</option>
                <option value="Break">Break</option>
              </select>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={Math.floor(seg.duration_secs / 60)}
                  onChange={(e) =>
                    updateSegment(i, "duration_secs", parseInt(e.target.value || "1") * 60)
                  }
                  className="w-16 px-2 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700
                    text-xs text-neutral-200 text-center focus:outline-none focus:border-neutral-500"
                />
                <span className="text-xs text-neutral-500">min</span>
              </div>
              <button
                onClick={() => removeSegment(i)}
                disabled={segments.length <= 1}
                className="w-6 h-6 flex items-center justify-center rounded text-neutral-500
                  hover:text-red-400 disabled:opacity-30 transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addSegment}
          className="mt-2 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          + Add segment
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
        <button
          onClick={onCancel}
          className="px-4 py-1.5 rounded-lg text-xs text-neutral-400
            hover:bg-neutral-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="px-4 py-1.5 rounded-lg text-xs text-neutral-200
            bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40
            transition-colors"
        >
          Save
        </button>
      </div>
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
