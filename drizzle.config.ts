import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  console.error("⚠️  DATABASE_URL environment variable is not set!");
  console.error("Please set DATABASE_URL in your .env file or environment variables.");
  console.error("Example: DATABASE_URL=postgresql://username:password@localhost:5432/database_name");
  throw new Error("DATABASE_URL must be set. Please check your environment configuration.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});