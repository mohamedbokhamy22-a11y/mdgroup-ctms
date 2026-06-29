// Prompt: "Build a CRUD controller for Visits in MDGroup CTMS. Visits are scheduled
// interactions (site-based or home visits) linked to an Enrollment. Track visit type,
// status, scheduling. Include HCP assignments and equipment requests in detail view."

import { Request, Response } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNotFound,
  sendBadRequest,
  parsePagination,
} from "../utils/response";

const createVisitSchema = z.object({
  enrollmentId: z.string().min(1),
  siteId: z.string().min(1),
  visitType: z.enum(["SITE_BASED", "HOME_VISIT", "TELEHEALTH", "REMOTE_MONITORING"]),
  status: z
    .enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "MISSED", "CANCELLED", "RESCHEDULED"])
    .default("SCHEDULED"),
  visitNumber: z.coerce.number().int(),
  visitName: z.string().min(1),
  scheduledDate: z.coerce.date(),
  completedDate: z.coerce.date().optional(),
  duration: z.coerce.number().int().optional(),
  notes: z.string().optional(),
});

const updateVisitSchema = createVisitSchema.partial();

export const listVisits = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const { enrollmentId, siteId, status, visitType, dateFrom, dateTo } =
    req.query as Record<string, string>;

  const where: Prisma.VisitWhereInput = {
    ...(enrollmentId && { enrollmentId }),
    ...(siteId && { siteId }),
    ...(status && { status: status as Prisma.EnumVisitStatusFilter }),
    ...(visitType && { visitType: visitType as Prisma.EnumVisitTypeFilter }),
    ...((dateFrom || dateTo) && {
      scheduledDate: {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      },
    }),
  };

  const [visits, total] = await Promise.all([
    prisma.visit.findMany({
      where,
      skip,
      take: limit,
      include: {
        enrollment: {
          include: {
            participant: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { scheduledDate: "asc" },
    }),
    prisma.visit.count({ where }),
  ]);

  sendPaginated(res, visits, total, page, limit);
};

export const getVisit = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const visit = await prisma.visit.findUnique({
    where: { id },
    include: {
      enrollment: {
        include: {
          participant: true,
        },
      },
      site: true,
      hcpAssignments: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      equipmentRequests: true,
    },
  });

  if (!visit) {
    sendNotFound(res, "Visit");
    return;
  }

  sendSuccess(res, visit);
};

export const createVisit = async (req: Request, res: Response): Promise<void> => {
  const parsed = createVisitSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const visit = await prisma.visit.create({ data: parsed.data });
  sendCreated(res, visit, "Visit created");
};

export const updateVisit = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const parsed = updateVisitSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const updateData = { ...parsed.data };

  // Auto-set completedDate when transitioning to COMPLETED if not explicitly provided
  if (updateData.status === "COMPLETED" && !updateData.completedDate) {
    updateData.completedDate = new Date();
  }

  try {
    const visit = await prisma.visit.update({
      where: { id },
      data: updateData,
    });
    sendSuccess(res, visit, "Visit updated");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Visit");
      return;
    }
    throw err;
  }
};

export const deleteVisit = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const visit = await prisma.visit.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    sendSuccess(res, visit, "Visit cancelled");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Visit");
      return;
    }
    throw err;
  }
};
