import { getDb, saveDb } from "../db.js";

export interface EntryRow {
  id: number;
  user_id: number;
  label: string;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

function query(sql: string, params: any[] = []): EntryRow[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: EntryRow[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as EntryRow);
  }
  stmt.free();
  return rows;
}

function run(sql: string, params: any[] = []) {
  const db = getDb();
  db.run(sql, params);
  saveDb();
}

function getEntryById(entryId: number, userId: number): EntryRow | null {
  const rows = query("SELECT * FROM entries WHERE id = ? AND user_id = ?", [entryId, userId]);
  return rows[0] || null;
}

export function getActiveEntry(userId: number): EntryRow | null {
  const rows = query("SELECT * FROM entries WHERE user_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1", [userId]);
  return rows[0] || null;
}

export function startEntry(userId: number, label: string): EntryRow {
  const active = getActiveEntry(userId);
  const now = new Date().toISOString();
  if (active) {
    run("UPDATE entries SET ended_at = ? WHERE id = ?", [now, active.id]);
  }
  run("INSERT INTO entries (user_id, label, started_at) VALUES (?, ?, ?)", [userId, label, now]);
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM entries ORDER BY id DESC LIMIT 1");
  stmt.bind([]);
  stmt.step();
  const row = stmt.getAsObject() as unknown as EntryRow;
  stmt.free();
  return row;
}

export function stopEntry(userId: number): EntryRow | null {
  const active = getActiveEntry(userId);
  if (!active) return null;
  const now = new Date().toISOString();
  run("UPDATE entries SET ended_at = ? WHERE id = ?", [now, active.id]);
  const rows = query("SELECT * FROM entries WHERE id = ?", [active.id]);
  return rows[0] || null;
}

export function getEntriesByDate(userId: number, date: string): EntryRow[] {
  const start = new Date(`${date}T00:00:00`).toISOString();
  const end = new Date(`${date}T23:59:59`).toISOString();
  return query("SELECT * FROM entries WHERE user_id = ? AND started_at >= ? AND started_at <= ? ORDER BY started_at", [userId, start, end]);
}

export function getEntriesByRange(userId: number, fromDt: string, toDt: string): EntryRow[] {
  return query("SELECT * FROM entries WHERE user_id = ? AND started_at >= ? AND started_at <= ? ORDER BY started_at", [userId, fromDt, toDt]);
}

export function updateEntry(entryId: number, userId: number, data: Record<string, unknown>): EntryRow | null {
  const entry = getEntryById(entryId, userId);
  if (!entry) return null;
  const fields = Object.keys(data).filter((k) => data[k] !== undefined);
  if (fields.length === 0) return entry;
  const setClause = fields.map((f) => `${f} = ?`).join(", ");
  const values = fields.map((f) => data[f]);
  run(`UPDATE entries SET ${setClause} WHERE id = ?`, [...values, entryId]);
  return getEntryById(entryId, userId);
}

export function deleteEntry(entryId: number, userId: number): boolean {
  const db = getDb();
  db.run("DELETE FROM entries WHERE id = ? AND user_id = ?", [entryId, userId]);
  saveDb();
  return db.getRowsModified() > 0;
}