// Prompt: "Build a CRUD controller for Sites (research locations) in the MDGroup CTMS.
// Sites link to Studies via the StudySite join table. Support city/country filtering
// and study association management via addSiteToStudy / removeSiteFromStudy."

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

const createSiteSchema = z.object({
  name: z.string().min(1),
  siteCode: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  principalInvestigator: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

const updateSiteSchema = createSiteSchema.partial();

const studySiteBodySchema = z.object({
  studyId: z.string().min(1),
  siteId: z.string().min(1),
});

export const listSites = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const { city, country } = req.query as Record<string, string>;

  const where: Prisma.SiteWhereInput = {
    deletedAt: null,
    ...(city && { city: { contains: city, mode: "insensitive" } }),
    ...(country && { country: { contains: country, mode: "insensitive" } }),
  };

  const [sites, total] = await Promise.all([
    prisma.site.findMany({
      where,
      skip,
      take: limit,
      include: { _count: { select: { enrollments: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.site.count({ where }),
  ]);

  sendPaginated(res, sites, total, page, limit);
};

export const getSite = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const site = await prisma.site.findUnique({
    where: { id, deletedAt: null },
    include: {
      studies: {
        include: {
          study: { select: { id: true, protocolNumber: true, title: true } },
        },
      },
    },
  });

  if (!site) {
    sendNotFound(res, "Site");
    return;
  }

  sendSuccess(res, site);
};

export const createSite = async (req: Request, res: Response): Promise<void> => {
  const parsed = createSiteSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const site = await prisma.site.create({ data: parsed.data });
  sendCreated(res, site, "Site created");
};

export const updateSite = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const parsed = updateSiteSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  try {
    const site = await prisma.site.update({
      where: { id },
      data: parsed.data,
    });
    sendSuccess(res, site, "Site updated");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Site");
      return;
    }
    throw err;
  }
};

export const deleteSite = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const site = await prisma.site.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    sendSuccess(res, site, "Site deleted");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Site");
      return;
    }
    throw err;
  }
};

export const addSiteToStudy = async (req: Request, res: Response): Promise<void> => {
  const parsed = studySiteBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const { studyId, siteId } = parsed.data;

  try {
    const studySite = await prisma.studySite.create({
      data: { studyId, siteId },
    });
    sendCreated(res, studySite, "Site linked to study");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2002") {
      res.status(409).json({ success: false, message: "Already linked" });
      return;
    }
    throw err;
  }
};

export const removeSiteFromStudy = async (req: Request, res: Response): Promise<void> => {
  const parsed = studySiteBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const { studyId, siteId } = parsed.data;

  try {
    await prisma.studySite.delete({
      where: { studyId_siteId: { studyId, siteId } },
    });
    sendSuccess(res, null, "Site removed from study");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Study-site link");
      return;
    }
    throw err;
  }
};
