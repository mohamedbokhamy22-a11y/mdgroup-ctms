// Prompt: "Build a CRUD controller for Studies (clinical trials) in the MDGroup CTMS.
// Studies belong to a Sponsor. Support filtering by status, phase, sponsorId.
// Include sponsor name and enrollment/site counts in responses."

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

const createStudySchema = z.object({
  protocolNumber: z.string().min(1),
  title: z.string().min(1),
  phase: z.enum(["PHASE_1", "PHASE_2", "PHASE_3", "PHASE_4", "OBSERVATIONAL"]),
  status: z.enum(["DRAFT", "ACTIVE", "ON_HOLD", "COMPLETED", "TERMINATED"]).default("DRAFT"),
  indication: z.string().min(1),
  sponsorId: z.string().min(1),
  therapeuticArea: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  targetEnrollment: z.coerce.number().default(0),
  description: z.string().optional(),
});

const updateStudySchema = createStudySchema.partial();

export const listStudies = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const { status, phase, sponsorId } = req.query as Record<string, string>;

  const where: Prisma.StudyWhereInput = {
    deletedAt: null,
    ...(status && { status: status as Prisma.EnumStudyStatusFilter }),
    ...(phase && { phase: phase as Prisma.EnumStudyPhaseFilter }),
    ...(sponsorId && { sponsorId }),
  };

  const [studies, total] = await Promise.all([
    prisma.study.findMany({
      where,
      skip,
      take: limit,
      include: {
        sponsor: { select: { id: true, name: true } },
        _count: { select: { enrollments: true, sites: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.study.count({ where }),
  ]);

  sendPaginated(res, studies, total, page, limit);
};

export const getStudy = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const study = await prisma.study.findUnique({
    where: { id, deletedAt: null },
    include: {
      sponsor: true,
      _count: { select: { enrollments: true, sites: true } },
    },
  });

  if (!study) {
    sendNotFound(res, "Study");
    return;
  }

  sendSuccess(res, study);
};

export const createStudy = async (req: Request, res: Response): Promise<void> => {
  const parsed = createStudySchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const study = await prisma.study.create({ data: parsed.data });
  sendCreated(res, study, "Study created");
};

export const updateStudy = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const parsed = updateStudySchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  try {
    const study = await prisma.study.update({
      where: { id },
      data: parsed.data,
    });
    sendSuccess(res, study, "Study updated");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Study");
      return;
    }
    throw err;
  }
};

export const deleteStudy = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const study = await prisma.study.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    sendSuccess(res, study, "Study deleted");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Study");
      return;
    }
    throw err;
  }
};
