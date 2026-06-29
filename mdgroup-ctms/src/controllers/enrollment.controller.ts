// Prompt: "Build a CRUD controller for Enrollments in MDGroup CTMS — the join between
// a Participant and a Study at a specific Site. Track status lifecycle from SCREENING
// through COMPLETED or WITHDRAWN. Include participant, study, site details."

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

const createEnrollmentSchema = z.object({
  participantId: z.string().min(1),
  studyId: z.string().min(1),
  siteId: z.string().min(1),
  status: z
    .enum(["SCREENING", "ENROLLED", "ACTIVE", "COMPLETED", "WITHDRAWN", "SCREEN_FAILED"])
    .default("SCREENING"),
  screeningDate: z.coerce.date().optional(),
  enrollmentDate: z.coerce.date().optional(),
  completionDate: z.coerce.date().optional(),
  withdrawalDate: z.coerce.date().optional(),
  withdrawalReason: z.string().optional(),
  subjectNumber: z.string().optional(),
});

const updateEnrollmentSchema = createEnrollmentSchema.partial();

export const listEnrollments = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const { studyId, siteId, status, participantId } = req.query as Record<string, string>;

  const where: Prisma.EnrollmentWhereInput = {
    ...(studyId && { studyId }),
    ...(siteId && { siteId }),
    ...(participantId && { participantId }),
    ...(status && { status: status as Prisma.EnumEnrollmentStatusFilter }),
  };

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip,
      take: limit,
      include: {
        participant: { select: { id: true, firstName: true, lastName: true } },
        study: { select: { id: true, protocolNumber: true, title: true } },
        site: { select: { id: true, name: true, siteCode: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.count({ where }),
  ]);

  sendPaginated(res, enrollments, total, page, limit);
};

export const getEnrollment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: {
      participant: true,
      study: true,
      site: true,
      visits: true,
    },
  });

  if (!enrollment) {
    sendNotFound(res, "Enrollment");
    return;
  }

  sendSuccess(res, enrollment);
};

export const createEnrollment = async (req: Request, res: Response): Promise<void> => {
  const parsed = createEnrollmentSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  try {
    const enrollment = await prisma.enrollment.create({ data: parsed.data });
    sendCreated(res, enrollment, "Enrollment created");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2002") {
      res.status(409).json({ success: false, message: "Participant already enrolled in this study" });
      return;
    }
    throw err;
  }
};

export const updateEnrollment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const parsed = updateEnrollmentSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  try {
    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: parsed.data,
    });
    sendSuccess(res, enrollment, "Enrollment updated");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Enrollment");
      return;
    }
    throw err;
  }
};

export const deleteEnrollment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.enrollment.delete({ where: { id } });
    sendSuccess(res, null, "Enrollment deleted");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Enrollment");
      return;
    }
    throw err;
  }
};
