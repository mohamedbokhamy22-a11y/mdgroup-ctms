// Prompt: "Build a CRUD controller for AdverseEvents in MDGroup CTMS — safety events
// reported during a clinical trial. Support severity filtering, sponsor reporting flag,
// and resolution tracking. Critical for regulatory compliance."

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

const createAdverseEventSchema = z.object({
  participantId: z.string().min(1),
  severity: z.enum(["MILD", "MODERATE", "SEVERE", "LIFE_THREATENING", "FATAL"]),
  eventDate: z.coerce.date(),
  description: z.string().min(1),
  outcome: z.string().optional(),
});

const updateAdverseEventSchema = createAdverseEventSchema.partial().extend({
  status: z.enum(["REPORTED", "UNDER_REVIEW", "RESOLVED", "ONGOING"]).optional(),
  reportedToSponsor: z.boolean().optional(),
  resolvedAt: z.coerce.date().optional(),
});

export const listAdverseEvents = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const { participantId, severity, status, reportedToSponsor } = req.query as Record<string, string>;

  const where: Prisma.AdverseEventWhereInput = {
    ...(participantId && { participantId }),
    ...(severity && { severity: severity as Prisma.EnumAdverseEventSeverityFilter }),
    ...(status && { status: status as Prisma.EnumAdverseEventStatusFilter }),
    ...(reportedToSponsor !== undefined && {
      reportedToSponsor: reportedToSponsor === "true",
    }),
  };

  const [adverseEvents, total] = await Promise.all([
    prisma.adverseEvent.findMany({
      where,
      skip,
      take: limit,
      include: {
        participant: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { eventDate: "desc" },
    }),
    prisma.adverseEvent.count({ where }),
  ]);

  sendPaginated(res, adverseEvents, total, page, limit);
};

export const getAdverseEvent = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const adverseEvent = await prisma.adverseEvent.findUnique({
    where: { id },
    include: {
      participant: true,
    },
  });

  if (!adverseEvent) {
    sendNotFound(res, "AdverseEvent");
    return;
  }

  sendSuccess(res, adverseEvent);
};

export const createAdverseEvent = async (req: Request, res: Response): Promise<void> => {
  const parsed = createAdverseEventSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const adverseEvent = await prisma.adverseEvent.create({
    data: {
      ...parsed.data,
      status: "REPORTED",
    },
  });

  sendCreated(res, adverseEvent, "Adverse event created");
};

export const updateAdverseEvent = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const parsed = updateAdverseEventSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const updateData = { ...parsed.data };

  // Auto-set resolvedAt when status transitions to RESOLVED if not explicitly provided
  if (updateData.status === "RESOLVED" && !updateData.resolvedAt) {
    const existing = await prisma.adverseEvent.findUnique({
      where: { id },
      select: { resolvedAt: true },
    });
    if (!existing?.resolvedAt) {
      updateData.resolvedAt = new Date();
    }
  }

  try {
    const adverseEvent = await prisma.adverseEvent.update({
      where: { id },
      data: updateData,
    });
    sendSuccess(res, adverseEvent, "Adverse event updated");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "AdverseEvent");
      return;
    }
    throw err;
  }
};

export const deleteAdverseEvent = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.adverseEvent.delete({ where: { id } });
    sendSuccess(res, null, "Adverse event deleted");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "AdverseEvent");
      return;
    }
    throw err;
  }
};
