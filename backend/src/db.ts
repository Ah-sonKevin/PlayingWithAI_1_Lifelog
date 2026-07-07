import initSqlJs, { type Database } from "sql.js";
import fs from "fs";
import { DATABASE_PATH } from "./config.js";

let db: Database;

export async function initDb() {
  const SQL = await initSqlJs();
  let buffer: Buffer | undefined;
  try {
    buffer = fs.readFileSync(DATABASE_PATH);
  } catch {
    // File doesn't exist yet, will create new
  }
  db = new SQL.Database(buffer);
  db.run("PRAGMA journal_mode = WAL");
  db.run("PRAGMA foreign_keys = ON");
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      label TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  db.run("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");
  db.run("CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_entries_user_started ON entries(user_id, started_at)");
  saveDb();
}

export function saveDb() {
  const buffer = db.export();
  fs.writeFileSync(DATABASE_PATH, buffer);
}

export function getDb() {
  return db;
}