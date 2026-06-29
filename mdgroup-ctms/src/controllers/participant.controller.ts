// Prompt: "Build a CRUD controller for Participants (patients) in MDGroup CTMS.
// Participants are the patients enrolled in clinical trials. Support search by name,
// country, requiresAssistance flag. Soft-delete pattern. Include enrollment count."

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

const createParticipantSchema = z.object({
  externalRef: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.coerce.date(),
  email: z.string().email().optional(),
  phone: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().min(1),
  language: z.string().default("en"),
  emergencyContact: z.string().optional(),
  requiresAssistance: z.boolean().default(false),
  notes: z.string().optional(),
});

const updateParticipantSchema = createParticipantSchema.partial();

export const listParticipants = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const { search, country, requiresAssistance } = req.query as Record<string, string>;

  const where: Prisma.ParticipantWhereInput = {
    deletedAt: null,
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(country && { country: { contains: country, mode: "insensitive" } }),
    ...(requiresAssistance !== undefined && {
      requiresAssistance: requiresAssistance === "true",
    }),
  };

  const [participants, total] = await Promise.all([
    prisma.participant.findMany({
      where,
      skip,
      take: limit,
      include: { _count: { select: { enrollments: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.participant.count({ where }),
  ]);

  sendPaginated(res, participants, total, page, limit);
};

export const getParticipant = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const participant = await prisma.participant.findUnique({
    where: { id, deletedAt: null },
    include: {
      enrollments: {
        include: {
          study: { select: { id: true, title: true, protocolNumber: true } },
          site: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!participant) {
    sendNotFound(res, "Participant");
    return;
  }

  sendSuccess(res, participant);
};

export const createParticipant = async (req: Request, res: Response): Promise<void> => {
  const parsed = createParticipantSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const participant = await prisma.participant.create({ data: parsed.data });
  sendCreated(res, participant, "Participant created");
};

export const updateParticipant = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const parsed = updateParticipantSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  try {
    const participant = await prisma.participant.update({
      where: { id },
      data: parsed.data,
    });
    sendSuccess(res, participant, "Participant updated");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Participant");
      return;
    }
    throw err;
  }
};

export const deleteParticipant = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const participant = await prisma.participant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    sendSuccess(res, participant, "Participant deleted");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Participant");
      return;
    }
    throw err;
  }
};
