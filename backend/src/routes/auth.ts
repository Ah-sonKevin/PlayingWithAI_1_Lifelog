import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getDb, saveDb } from "../db.js";
import { registerSchema, loginSchema } from "../schemas/auth.js";
import { hashPassword, verifyPassword, createAccessToken } from "../services/auth-service.js";

export const authRouter = new Hono();

authRouter.post("/register", zValidator("json", registerSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?");
  existing.bind([email]);
  if (existing.step()) {
    existing.free();
    return c.json({ detail: "Email already registered" }, 400);
  }
  existing.free();

  const passwordHash = hashPassword(password);
  db.run("INSERT INTO users (email, password_hash) VALUES (?, ?)", [email, passwordHash]);
  saveDb();

  const stmt = db.prepare("SELECT id FROM users WHERE email = ?");
  stmt.bind([email]);
  stmt.step();
  const row = stmt.getAsObject() as { id: number };
  stmt.free();

  const token = createAccessToken(row.id);
  return c.json({ access_token: token, token_type: "bearer" });
});

authRouter.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  stmt.bind([email]);
  if (!stmt.step()) {
    stmt.free();
    return c.json({ detail: "Invalid email or password" }, 401);
  }
  const user = stmt.getAsObject() as { id: number; email: string; password_hash: string };
  stmt.free();

  if (!verifyPassword(password, user.password_hash)) {
    return c.json({ detail: "Invalid email or password" }, 401);
  }
  const token = createAccessToken(user.id);
  return c.json({ access_token: token, token_type: "bearer" });
});

authRouter.get("/me", async (c) => {
  const user = c.get("user");
  return c.json({ id: user.id, email: user.email });
});