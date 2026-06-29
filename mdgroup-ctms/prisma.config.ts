// Prompt: "Configure Prisma 7 datasource in prisma.config.ts — in Prisma 7 the
// database URL moves out of schema.prisma and into this config file."

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});
