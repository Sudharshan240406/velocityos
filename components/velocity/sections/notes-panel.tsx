"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format, parseISO } from "date-fns";
import { GlassCard, SectionHeader } from "@/components/velocity/ui";
import type { Note } from "@/lib/types";

export function NotesPanel({
  activeNote,
  filteredNotes,
  noteSearch,
  onAddNote,
  onChangeNoteSearch,
  onSelectNote,
  onUpdateNote,
}: {
  activeNote?: Note;
  filteredNotes: Note[];
  noteSearch: string;
  onAddNote: () => void;
  onChangeNoteSearch: (value: string) => void;
  onSelectNote: (id: string) => void;
  onUpdateNote: (id: string, patch: Partial<Note>) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <GlassCard className="p-5">
        <div className="flex items-center justify-between">
          <SectionHeader eyebrow="Notes vault" title="Strategy notes" />
          <button type="button" onClick={onAddNote} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950">
            New
          </button>
        </div>
        <label htmlFor="note-search-input" className="sr-only">
          Search notes
        </label>
        <input
          id="note-search-input"
          value={noteSearch}
          onChange={(event) => onChangeNoteSearch(event.target.value)}
          placeholder="Search notes..."
          className="mt-4 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30"
        />
        <div className="mt-4 space-y-3">
          {filteredNotes.map((note) => (
            <button key={note.id} type="button" onClick={() => onSelectNote(note.id)} className="w-full rounded-[24px] border border-white/10 bg-black/20 p-4 text-left">
              <p className="text-white">{note.title}</p>
              <p className="mt-2 line-clamp-2 text-sm text-white/45">{note.content}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        {activeNote ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <label htmlFor="note-title-input" className="sr-only">
                Note Title
              </label>
              <input
                id="note-title-input"
                value={activeNote.title}
                onChange={(event) => onUpdateNote(activeNote.id, { title: event.target.value })}
                className="w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-2xl font-semibold text-white outline-none"
              />
              <label htmlFor="note-content-input" className="sr-only">
                Note Content
              </label>
              <textarea
                id="note-content-input"
                value={activeNote.content}
                onChange={(event) => onUpdateNote(activeNote.id, { content: event.target.value })}
                className="min-h-[420px] w-full rounded-[28px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-slate-200 outline-none"
              />
            </div>
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">Markdown preview</p>
                <div className="prose prose-invert mt-4 max-w-none text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeNote.content}</ReactMarkdown>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">Auto save</p>
                <p className="mt-3 text-sm text-white/65">Notes sync to local storage and IndexedDB automatically.</p>
                <p className="mt-2 text-xs text-white/35">Last update: {format(parseISO(activeNote.updatedAt), "dd MMM yyyy, HH:mm")}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-white/45">Select a note to begin.</p>
        )}
      </GlassCard>
    </div>
  );
}
