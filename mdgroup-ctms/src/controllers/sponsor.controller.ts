// Prompt: "Build a CRUD controller for Sponsors (pharmaceutical companies) in the MDGroup CTMS.
// Sponsors can be listed with pagination and search by name/country, fetched by ID, created,
// updated, and soft-deleted (set deletedAt). Always filter out soft-deleted records."

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

const createSponsorSchema = z.object({
  name: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().min(1),
});

const updateSponsorSchema = createSponsorSchema.partial();

export const listSponsors = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const { name, country } = req.query as Record<string, string>;

  const where: Prisma.SponsorWhereInput = {
    deletedAt: null,
    ...(name && { name: { contains: name, mode: "insensitive" } }),
    ...(country && { country: { contains: country, mode: "insensitive" } }),
  };

  const [sponsors, total] = await Promise.all([
    prisma.sponsor.findMany({
      where,
      skip,
      take: limit,
      include: { _count: { select: { studies: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sponsor.count({ where }),
  ]);

  sendPaginated(res, sponsors, total, page, limit);
};

export const getSponsor = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const sponsor = await prisma.sponsor.findUnique({
    where: { id, deletedAt: null },
    include: { _count: { select: { studies: true } } },
  });

  if (!sponsor) {
    sendNotFound(res, "Sponsor");
    return;
  }

  sendSuccess(res, sponsor);
};

export const createSponsor = async (req: Request, res: Response): Promise<void> => {
  const parsed = createSponsorSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const sponsor = await prisma.sponsor.create({ data: parsed.data });
  sendCreated(res, sponsor, "Sponsor created");
};

export const updateSponsor = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const parsed = updateSponsorSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  try {
    const sponsor = await prisma.sponsor.update({
      where: { id },
      data: parsed.data,
    });
    sendSuccess(res, sponsor, "Sponsor updated");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Sponsor");
      return;
    }
    throw err;
  }
};

export const deleteSponsor = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const sponsor = await prisma.sponsor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    sendSuccess(res, sponsor, "Sponsor deleted");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Sponsor");
      return;
    }
    throw err;
  }
};
