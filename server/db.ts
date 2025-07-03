import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("⚠️  DATABASE_URL environment variable is not set!");
  console.error("Please set DATABASE_URL in your .env file or environment variables.");
  console.error("Example: DATABASE_URL=postgresql://username:password@localhost:5432/database_name");
  process.exit(1);
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });