// Prompt: "Build a CRUD controller for EquipmentRequests in MDGroup CTMS.
// Equipment is requested per visit — e.g., EKG machines, lab kits, wearables.
// Track dispatch and delivery status with timestamps."

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

const createEquipmentSchema = z.object({
  visitId: z.string().min(1),
  equipmentName: z.string().min(1),
  quantity: z.coerce.number().int().positive().default(1),
  status: z
    .enum(["REQUESTED", "ALLOCATED", "DISPATCHED", "DELIVERED", "IN_USE", "RETURNED", "LOST"])
    .default("REQUESTED"),
  supplier: z.string().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

const updateEquipmentSchema = createEquipmentSchema.partial().extend({
  dispatchedAt: z.coerce.date().optional(),
  deliveredAt: z.coerce.date().optional(),
  returnedAt: z.coerce.date().optional(),
});

export const listEquipment = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const { visitId, status } = req.query as Record<string, string>;

  const where: Prisma.EquipmentRequestWhereInput = {
    ...(visitId && { visitId }),
    ...(status && { status: status as Prisma.EnumEquipmentStatusFilter }),
  };

  const [equipment, total] = await Promise.all([
    prisma.equipmentRequest.findMany({
      where,
      skip,
      take: limit,
      include: {
        visit: {
          select: {
            id: true,
            scheduledDate: true,
            enrollment: {
              include: {
                participant: { select: { id: true, firstName: true, lastName: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.equipmentRequest.count({ where }),
  ]);

  sendPaginated(res, equipment, total, page, limit);
};

export const getEquipment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const equipment = await prisma.equipmentRequest.findUnique({
    where: { id },
    include: {
      visit: {
        include: {
          enrollment: {
            include: {
              participant: true,
            },
          },
        },
      },
    },
  });

  if (!equipment) {
    sendNotFound(res, "EquipmentRequest");
    return;
  }

  sendSuccess(res, equipment);
};

export const createEquipment = async (req: Request, res: Response): Promise<void> => {
  const parsed = createEquipmentSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const equipment = await prisma.equipmentRequest.create({ data: parsed.data });
  sendCreated(res, equipment, "Equipment request created");
};

export const updateEquipment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const parsed = updateEquipmentSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const updateData = { ...parsed.data };

  // Auto-set dispatchedAt when status transitions to DISPATCHED if not already provided
  if (updateData.status === "DISPATCHED" && !updateData.dispatchedAt) {
    const existing = await prisma.equipmentRequest.findUnique({
      where: { id },
      select: { dispatchedAt: true },
    });
    if (!existing?.dispatchedAt) {
      updateData.dispatchedAt = new Date();
    }
  }

  try {
    const equipment = await prisma.equipmentRequest.update({
      where: { id },
      data: updateData,
    });
    sendSuccess(res, equipment, "Equipment request updated");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "EquipmentRequest");
      return;
    }
    throw err;
  }
};

export const deleteEquipment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.equipmentRequest.delete({ where: { id } });
    sendSuccess(res, null, "Equipment request deleted");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "EquipmentRequest");
      return;
    }
    throw err;
  }
};
