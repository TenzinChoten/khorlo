import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    // [Reason] Keep marketplace plan prices in the existing Plan table via seed, not a new schema
    seed: "npx tsx prisma/seed.ts",
  },

  datasource: {
    url: process.env["DIRECT_URL"],
  },
});