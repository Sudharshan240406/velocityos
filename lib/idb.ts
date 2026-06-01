import { openDB } from "idb";
import type { Note, SessionLog } from "./types";

const DB_NAME = "focusos-db";
const DB_VERSION = 1;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("sessions")) {
        db.createObjectStore("sessions", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "id" });
      }
    },
  });
}

export async function saveSessions(sessions: SessionLog[]) {
  const db = await getDB();
  const tx = db.transaction("sessions", "readwrite");
  await tx.store.clear();
  await Promise.all(sessions.map((session) => tx.store.put(session)));
  await tx.done;
}

export async function loadSessions() {
  const db = await getDB();
  return db.getAll("sessions");
}

export async function saveNotes(notes: Note[]) {
  const db = await getDB();
  const tx = db.transaction("notes", "readwrite");
  await tx.store.clear();
  await Promise.all(notes.map((note) => tx.store.put(note)));
  await tx.done;
}

export async function loadNotes() {
  const db = await getDB();
  return db.getAll("notes");
}
