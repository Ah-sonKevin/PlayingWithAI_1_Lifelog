import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterIn = z.infer<typeof registerSchema>;
export type LoginIn = z.infer<typeof loginSchema>;

export interface TokenOut {
  access_token: string;
  token_type: string;
}

export interface UserOut {
  id: number;
  email: string;
}