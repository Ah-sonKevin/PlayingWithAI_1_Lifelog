import { getDb } from "../db.js";
import type { EntryRow } from "./entry-service.js";

function durationSeconds(startedAt: string, endedAt: string | null): number {
  const end = endedAt ? new Date(endedAt) : new Date();
  return Math.floor((end.getTime() - new Date(startedAt).getTime()) / 1000);
}

export function getStats(userId: number, fromDt: string, toDt: string) {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM entries WHERE user_id = ? AND started_at >= ? AND started_at <= ? ORDER BY started_at");
  stmt.bind([userId, fromDt, toDt]);
  const entries: EntryRow[] = [];
  while (stmt.step()) {
    entries.push(stmt.getAsObject() as unknown as EntryRow);
  }
  stmt.free();

  // Totals by label
  const totals: Record<string, number> = {};
  for (const e of entries) {
    const secs = durationSeconds(e.started_at, e.ended_at);
    totals[e.label] = (totals[e.label] || 0) + secs;
  }

  const totalsByLabel = Object.entries(totals)
    .map(([label, total_seconds]) => ({ label, total_seconds }))
    .sort((a, b) => b.total_seconds - a.total_seconds);

  const totalAll = totalsByLabel.reduce((s, t) => s + t.total_seconds, 0) || 1;

  const distribution = totalsByLabel.map((t) => ({
    label: t.label,
    percentage: Math.round((t.total_seconds / totalAll) * 1000) / 10,
  }));

  // Tasks per day and daily series
  const dayCounts: Record<string, number> = {};
  const daySeconds: Record<string, number> = {};

  for (const e of entries) {
    const dayKey = e.started_at.slice(0, 10);
    dayCounts[dayKey] = (dayCounts[dayKey] || 0) + 1;
    const end = e.ended_at ? new Date(e.ended_at) : new Date();
    daySeconds[dayKey] = (daySeconds[dayKey] || 0) + Math.floor((end.getTime() - new Date(e.started_at).getTime()) / 1000);
  }

  const tasksPerDay = Object.entries(dayCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const dailySeries = Object.entries(daySeconds)
    .map(([date, total_seconds]) => ({ date, total_seconds }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totals_by_label: totalsByLabel,
    tasks_per_day: tasksPerDay,
    distribution,
    daily_series: dailySeries,
  };
}