// Prompt: "Build a CRUD controller for Messages in MDGroup CTMS — the communication
// channel between participants and their assigned patient navigators. Support threaded
// inbox view per participant, mark-as-read, and outbound message sending."

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

const createMessageSchema = z.object({
  participantId: z.string().min(1),
  direction: z.enum(["INBOUND", "OUTBOUND"]),
  subject: z.string().optional(),
  body: z.string().min(1),
  channel: z.string().default("PLATFORM"),
});

const markReadSchema = z.object({
  messageIds: z.array(z.string()),
});

export const listMessages = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const { participantId, direction, isRead, navigatorId } = req.query as Record<string, string>;

  const where: Prisma.MessageWhereInput = {
    ...(participantId && { participantId }),
    ...(direction && { direction: direction as Prisma.EnumMessageDirectionFilter }),
    ...(isRead !== undefined && { isRead: isRead === "true" }),
    ...(navigatorId && { navigatorId }),
  };

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      skip,
      take: limit,
      include: {
        participant: { select: { id: true, firstName: true, lastName: true } },
        navigator: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { sentAt: "desc" },
    }),
    prisma.message.count({ where }),
  ]);

  sendPaginated(res, messages, total, page, limit);
};

export const getMessage = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const message = await prisma.message.findUnique({
    where: { id },
    include: {
      participant: true,
      navigator: true,
    },
  });

  if (!message) {
    sendNotFound(res, "Message");
    return;
  }

  sendSuccess(res, message);
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  const parsed = createMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const { direction } = parsed.data;
  const navigatorId =
    direction === "OUTBOUND" ? (req as AuthenticatedRequest).user.sub : undefined;

  const message = await prisma.message.create({
    data: {
      ...parsed.data,
      ...(navigatorId && { navigatorId }),
      sentAt: new Date(),
    },
  });

  sendCreated(res, message, "Message sent");
};

export const markMessagesRead = async (req: Request, res: Response): Promise<void> => {
  const parsed = markReadSchema.safeParse(req.body);
  if (!parsed.success) {
    sendBadRequest(res, "Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    return;
  }

  const { messageIds } = parsed.data;

  const result = await prisma.message.updateMany({
    where: { id: { in: messageIds } },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  sendSuccess(res, { updatedCount: result.count }, "Messages marked as read");
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.message.delete({ where: { id } });
    sendSuccess(res, null, "Message deleted");
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2025") {
      sendNotFound(res, "Message");
      return;
    }
    throw err;
  }
};
