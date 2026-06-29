// Prompt: "Build a CRUD controller for TravelArrangements in MDGroup CTMS.
// Each arrangement is linked to a participant and a visit. Track mode of transport,
// origin/destination, booking status, costs."

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

const createTravelSchema = z.object({
  participantId: z.string().min(1),
  visitId: z.string().min(1),
  travelMode: z.enum(["FLIGHT", "TRAIN", "CAR_HIRE", "TAXI", "AMBULANCE", "OTHER"]),
  status: z
    .enum(["PENDING", "BOOKED", "CONFIRMED", "COMPLETED", "CANCELLED"])
    .default("PENDING"),
  origin: z.string().min(1),
  destination: z.string().min(1),
  departureDate: z.coerce.date(),
  returnDate: z.coerce.date().optional(),
  bookingRef: z.string().optional(),
  supplier: z.string().optional(),
  estimatedCost: z.number().optional(),
  actualCost: z.number().optional(),
  notes: z.string().optional(),
});

const updateTravelSchema = createTravelSchema.partial();

export const listTravel = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const { participantId, visitId, status, travelMode } = req.query as Record<string, string>;

  const where: Prisma.TravelArrangementWhereInput = {
    ...(participantId && { participantId }),
    ...(visitId && { visitId }),
    ...(status && { status: status as Prisma.EnumTravelStatusFilter }),
    ...(travelMode && { travelMode: travelMode as Prisma.EnumTravelModeFilter }),
  };

  const [travels, total] = await Promise.all([
    prisma.travelArrangement.findMany({
      where,
      skip,
      take: limit,
      include: {
        participant: { select: { id: true, firstName: true, lastName: true } },
        visit: { select: { id: true, scheduledDate: true } },
      },
      orderBy: { departureDate: "asc" },
    }),
    prisma.travelArrangement.count({ where }),
  ]);

  sendPaginated(res, travels, total, page, limit);
};

export const getTravel = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const travel = await prisma.travelArrangement.findUnique({
    where: { id },
    include: {
      participant: true,
      visit: true,
    },
  });

  if (!travel) {
    sendNotFound(res, "TravelArrangement");
    return;
  }

  sendSuccess(res, travel);
};

export const createTravel = async (req: Request, res: Response): Promise<void> => {
  const parsed = createTravelSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const travel = await prisma.travelArrangement.create({ data: parsed.data });
  sendCreated(res, travel, "Travel arrangement created");
};

export const updateTravel = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const parsed = updateTravelSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  try {
    const travel = await prisma.travelArrangement.update({
      where: { id },
      data: parsed.data,
    });
    sendSuccess(res, travel, "Travel arrangement updated");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "TravelArrangement");
      return;
    }
    throw err;
  }
};

export const deleteTravel = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.travelArrangement.delete({ where: { id } });
    sendSuccess(res, null, "Travel arrangement deleted");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "TravelArrangement");
      return;
    }
    throw err;
  }
};
