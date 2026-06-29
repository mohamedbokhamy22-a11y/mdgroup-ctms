// Prompt: "Build an auth controller for MDGroup CTMS with register and login endpoints.
// Hash passwords with bcrypt, issue JWT tokens on login, return user profile without
// the password hash."

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { sendSuccess, sendCreated, sendUnauthorized, sendBadRequest } from "../utils/response";
import { AuthenticatedRequest } from "../types";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["ADMIN", "COORDINATOR", "NAVIGATOR", "SITE_STAFF", "SPONSOR_USER"]).optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  const data = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    sendBadRequest(res, "Email already in use");
    return;
  }

  const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role ?? "NAVIGATOR",
      phone: data.phone,
    },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
  });

  sendCreated(res, user, "Account created");
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email, deletedAt: null } });
  if (!user || !user.isActive) {
    sendUnauthorized(res, "Invalid credentials");
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    sendUnauthorized(res, "Invalid credentials");
    return;
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );

  sendSuccess(res, {
    token,
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
  });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const { sub } = (req as AuthenticatedRequest).user;
  const user = await prisma.user.findUnique({
    where: { id: sub },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true, isActive: true, createdAt: true },
  });
  sendSuccess(res, user);
};
