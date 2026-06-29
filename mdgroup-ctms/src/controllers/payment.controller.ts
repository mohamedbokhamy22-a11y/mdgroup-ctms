// Prompt: "Build a CRUD controller for Payments in MDGroup CTMS — participant stipends,
// travel reimbursements, and expense claims. Payments have an approval workflow:
// PENDING → APPROVED → PROCESSING → PAID. Track who created and who approved each payment."

import { Request, Response } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../types";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNotFound,
  sendBadRequest,
  parsePagination,
} from "../utils/response";

const createPaymentSchema = z.object({
  participantId: z.string().min(1),
  paymentType: z.enum([
    "STIPEND",
    "TRAVEL_REIMBURSEMENT",
    "MEAL_ALLOWANCE",
    "ACCOMMODATION",
    "OTHER_EXPENSE",
  ]),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  paymentMethod: z
    .enum(["PREPAID_CARD", "BANK_TRANSFER", "CHECK", "DIGITAL_WALLET"])
    .default("PREPAID_CARD"),
  description: z.string().min(1),
  visitId: z.string().optional(),
  notes: z.string().optional(),
});

const updatePaymentSchema = createPaymentSchema.partial();

const approvePaymentSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const listPayments = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const { participantId, status, paymentType } = req.query as Record<string, string>;

  const where: Prisma.PaymentWhereInput = {
    ...(participantId && { participantId }),
    ...(status && { status: status as Prisma.EnumPaymentStatusFilter }),
    ...(paymentType && { paymentType: paymentType as Prisma.EnumPaymentTypeFilter }),
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      include: {
        participant: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.count({ where }),
  ]);

  sendPaginated(res, payments, total, page, limit);
};

export const getPayment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      participant: true,
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      approvedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!payment) {
    sendNotFound(res, "Payment");
    return;
  }

  sendSuccess(res, payment);
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  const parsed = createPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const createdById = (req as AuthenticatedRequest).user.sub;

  const payment = await prisma.payment.create({
    data: {
      ...parsed.data,
      status: "PENDING",
      createdById,
    },
  });

  sendCreated(res, payment, "Payment created");
};

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const parsed = updatePaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  try {
    const payment = await prisma.payment.update({
      where: { id },
      data: parsed.data,
    });
    sendSuccess(res, payment, "Payment updated");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Payment");
      return;
    }
    throw err;
  }
};

export const approvePayment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const parsed = approvePaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const approvedById = (req as AuthenticatedRequest).user.sub;
  const { status } = parsed.data;

  try {
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status,
        approvedById,
        ...(status === "APPROVED" && { processedAt: new Date() }),
      },
    });
    sendSuccess(res, payment, `Payment ${status.toLowerCase()}`);
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Payment");
      return;
    }
    throw err;
  }
};

export const deletePayment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const payment = await prisma.payment.findUnique({ where: { id } });

  if (!payment) {
    sendNotFound(res, "Payment");
    return;
  }

  if (payment.status !== "PENDING") {
    sendBadRequest(res, "Cannot delete non-pending payment");
    return;
  }

  await prisma.payment.delete({ where: { id } });
  sendSuccess(res, null, "Payment deleted");
};
