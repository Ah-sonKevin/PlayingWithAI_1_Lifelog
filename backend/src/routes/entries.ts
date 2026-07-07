import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { entryStartSchema, entryUpdateSchema } from "../schemas/entry.js";
import type { EntryOut } from "../schemas/entry.js";
import {
  getActiveEntry,
  startEntry,
  stopEntry,
  getEntriesByDate,
  getEntriesByRange,
  updateEntry,
  deleteEntry,
} from "../services/entry-service.js";

export const entriesRouter = new Hono();

function toEntryOut(row: { id: number; user_id: number; label: string; started_at: string; ended_at: string | null; created_at: string }): EntryOut {
  let duration: number | null = null;
  if (row.ended_at) {
    duration = Math.floor((new Date(row.ended_at).getTime() - new Date(row.started_at).getTime()) / 1000);
  }
  return {
    id: row.id,
    user_id: row.user_id,
    label: row.label,
    started_at: row.started_at,
    ended_at: row.ended_at,
    duration_seconds: duration,
    created_at: row.created_at,
  };
}

entriesRouter.post("/start", zValidator("json", entryStartSchema), async (c) => {
  const user = c.get("user");
  const { label } = c.req.valid("json");
  const entry = startEntry(user.id, label);
  return c.json(toEntryOut(entry));
});

entriesRouter.post("/stop", async (c) => {
  const user = c.get("user");
  const entry = stopEntry(user.id);
  if (!entry) {
    return c.json({ detail: "No active entry" }, 404);
  }
  return c.json(toEntryOut(entry));
});

entriesRouter.get("/active", async (c) => {
  const user = c.get("user");
  const entry = getActiveEntry(user.id);
  if (!entry) return c.json(null);
  return c.json(toEntryOut(entry));
});

entriesRouter.get("/", async (c) => {
  const user = c.get("user");
  const date = c.req.query("date");
  const from_ = c.req.query("from");
  const to = c.req.query("to");

  let entries;
  if (date) {
    entries = getEntriesByDate(user.id, date);
  } else if (from_ && to) {
    const fromDt = new Date(`${from_}T00:00:00`).toISOString();
    const toDt = new Date(`${to}T23:59:59`).toISOString();
    entries = getEntriesByRange(user.id, fromDt, toDt);
  } else {
    entries = [];
  }
  return c.json(entries.map(toEntryOut));
});

entriesRouter.patch("/:entryId", zValidator("json", entryUpdateSchema), async (c) => {
  const user = c.get("user");
  const entryId = parseInt(c.req.param("entryId"), 10);
  const data = c.req.valid("json");
  const entry = updateEntry(entryId, user.id, data as Record<string, unknown>);
  if (!entry) {
    return c.json({ detail: "Entry not found" }, 404);
  }
  return c.json(toEntryOut(entry));
});

entriesRouter.delete("/:entryId", async (c) => {
  const user = c.get("user");
  const entryId = parseInt(c.req.param("entryId"), 10);
  const deleted = deleteEntry(entryId, user.id);
  if (!deleted) {
    return c.json({ detail: "Entry not found" }, 404);
  }
  return c.body(null, 204);
});