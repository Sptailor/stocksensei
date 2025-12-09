import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Check if using placeholder database URL
const isPlaceholder = process.env.DATABASE_URL.includes("placeholder");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

if (isPlaceholder) {
  console.warn("⚠️ Using placeholder database - database features will not work");
}

export const db = drizzle(pool, { schema });
