export const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
export const JWT_ALGORITHM = "HS256";
export const ACCESS_TOKEN_EXPIRE_MINUTES = parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || "1440", 10);
export const TIMEZONE = process.env.TIMEZONE || "Europe/Paris";
export const DATABASE_PATH = process.env.DATABASE_PATH || "./lifelog.db";
export const PORT = parseInt(process.env.PORT || "8000", 10);