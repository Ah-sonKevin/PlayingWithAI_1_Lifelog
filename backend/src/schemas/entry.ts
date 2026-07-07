import { z } from "zod";

export const entryStartSchema = z.object({
  label: z.string().min(1),
});

export const entryUpdateSchema = z.object({
  label: z.string().optional(),
  started_at: z.string().optional(),
  ended_at: z.string().nullable().optional(),
});

export type EntryStart = z.infer<typeof entryStartSchema>;
export type EntryUpdate = z.infer<typeof entryUpdateSchema>;

export interface EntryOut {
  id: number;
  user_id: number;
  label: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  created_at: string;
}