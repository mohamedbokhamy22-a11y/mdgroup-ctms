// Prompt: "Write a global Express error handler that handles Prisma known errors (P2002
// unique constraint, P2025 not found), Zod validation errors, and generic errors.
// Return consistent JSON error envelopes and never leak stack traces in production."

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { env } from "../config/env";
import { ApiResponse } from "../types";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (env.NODE_ENV === "development") {
    console.error(err);
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join(".");
      errors[path] = errors[path] ?? [];
      errors[path].push(issue.message);
    }
    const body: ApiResponse = { success: false, message: "Validation failed", errors };
    res.status(400).json(body);
    return;
  }

  // Prisma unique constraint
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const fields = (err.meta?.target as string[])?.join(", ") ?? "field";
      res.status(409).json({ success: false, message: `Duplicate value on: ${fields}` });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ success: false, message: "Record not found" });
      return;
    }
  }

  // Generic
  const message = err instanceof Error ? err.message : "Internal server error";
  const body: ApiResponse = {
    success: false,
    message,
    ...(env.NODE_ENV === "development" && err instanceof Error
      ? { stack: err.stack } as object
      : {}),
  };
  res.status(500).json(body);
};
