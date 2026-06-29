// Prompt: "Build JWT authentication middleware for Express with role-based access control.
// verifyToken extracts and validates the Bearer token. requireRole is a factory that
// returns a middleware enforcing one of the allowed UserRole values."

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { env } from "../config/env";
import { JwtPayload, AuthenticatedRequest } from "../types";
import { sendUnauthorized, sendForbidden } from "../utils/response";

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    sendUnauthorized(res, "Missing or malformed authorization header");
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch {
    sendUnauthorized(res, "Invalid or expired token");
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      sendUnauthorized(res);
      return;
    }
    if (!roles.includes(user.role)) {
      sendForbidden(res, `Requires one of: ${roles.join(", ")}`);
      return;
    }
    next();
  };
};
