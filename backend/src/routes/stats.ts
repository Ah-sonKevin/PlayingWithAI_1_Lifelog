import { Hono } from "hono";
import { getStats } from "../services/stats-service.js";

export const statsRouter = new Hono();

statsRouter.get("/", async (c) => {
  const user = c.get("user");
  const from_ = c.req.query("from");
  const to = c.req.query("to");

  if (!from_ || !to) {
    return c.json({ detail: "from and to query parameters are required" }, 400);
  }

  const fromDt = new Date(`${from_}T00:00:00`).toISOString();
  const toDt = new Date(`${to}T23:59:59`).toISOString();
  const result = getStats(user.id, fromDt, toDt);
  return c.json(result);
});