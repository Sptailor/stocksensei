import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Check if using placeholder database URL
const isPlaceholder = process.env.DATABASE_URL.includes("placeholder");

let pool: Pool;
let db: ReturnType<typeof drizzle>;

if (isPlaceholder) {
  // Create a mock pool for demo purposes
  console.warn("⚠️ Using placeholder database - database features will not work");
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}

export { db };
