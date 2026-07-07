import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { initDb, getDb } from "./db.js";
import { decodeAccessToken } from "./services/auth-service.js";
import { authRouter } from "./routes/auth.js";
import { entriesRouter } from "./routes/entries.js";
import { statsRouter } from "./routes/stats.js";
import { PORT } from "./config.js";

async function main() {
  await initDb();

  const app = new Hono();

  app.use("*", cors({
    origin: "*",
    credentials: true,
  }));

  async function authMiddleware(c: any, next: any) {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ detail: "Invalid or expired token" }, 401);
    }
    const token = authHeader.slice(7);
    const userId = decodeAccessToken(token);
    if (!userId) {
      return c.json({ detail: "Invalid or expired token" }, 401);
    }
    const db = getDb();
    const stmt = db.prepare("SELECT id, email FROM users WHERE id = ?");
    stmt.bind([userId]);
    if (!stmt.step()) {
      stmt.free();
      return c.json({ detail: "User not found" }, 401);
    }
    const user = stmt.getAsObject() as { id: number; email: string };
    stmt.free();
    c.set("user", user);
    await next();
  }

  app.use("/api/entries/*", authMiddleware);
  app.use("/api/stats/*", authMiddleware);
  app.use("/api/auth/me", authMiddleware);

  app.route("/api/auth", authRouter);
  app.route("/api/entries", entriesRouter);
  app.route("/api/stats", statsRouter);

  const port = PORT;
  console.log(`Server running on http://localhost:${port}`);

  serve({
    fetch: app.fetch,
    port,
  });
}

main().catch(console.error);