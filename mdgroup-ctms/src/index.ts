// Prompt: "Build the Express app entry point for MDGroup CTMS. Configure middleware stack
// (helmet, cors, morgan, json parser), mount Swagger UI at /api-docs, register all
// API routes, attach global error handler, and start the HTTP server with graceful shutdown."

import "express-async-errors";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { prisma } from "./config/prisma";
import { registerRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// ── Security & utility middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: "*", methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"] }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── API Documentation ──────────────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "MDGroup CTMS API",
  swaggerOptions: { persistAuthorization: true },
}));

app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "mdgroup-ctms", timestamp: new Date().toISOString() });
});

// ── API routes ─────────────────────────────────────────────────────────────────
registerRoutes(app);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

// ── Global error handler ───────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────────────────────────
const server = app.listen(env.PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║     MDGroup Clinical Trial Management System     ║
  ╠══════════════════════════════════════════════════╣
  ║  API:     http://localhost:${env.PORT}/api            ║
  ║  Docs:    http://localhost:${env.PORT}/api-docs        ║
  ║  Health:  http://localhost:${env.PORT}/health          ║
  ║  Env:     ${env.NODE_ENV.padEnd(38)}║
  ╚══════════════════════════════════════════════════╝
  `);
});

// ── Graceful shutdown ──────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Database connection closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;
