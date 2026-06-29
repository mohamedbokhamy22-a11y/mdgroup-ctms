// Prompt: "Create Express response helper functions for consistent API response
// formatting: success, created, paginated, notFound, badRequest, unauthorized, forbidden."

import { Response } from "express";
import { ApiResponse } from "../types";

export const sendSuccess = <T>(res: Response, data: T, message?: string, status = 200) => {
  const body: ApiResponse<T> = { success: true, data, message };
  return res.status(status).json(body);
};

export const sendCreated = <T>(res: Response, data: T, message = "Resource created") => {
  return sendSuccess(res, data, message, 201);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
) => {
  const body: ApiResponse<T[]> = {
    success: true,
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
  return res.status(200).json(body);
};

export const sendNotFound = (res: Response, entity = "Resource") => {
  const body: ApiResponse = { success: false, message: `${entity} not found` };
  return res.status(404).json(body);
};

export const sendBadRequest = (res: Response, message: string, errors?: Record<string, string[]>) => {
  const body: ApiResponse = { success: false, message, errors };
  return res.status(400).json(body);
};

export const sendUnauthorized = (res: Response, message = "Unauthorized") => {
  const body: ApiResponse = { success: false, message };
  return res.status(401).json(body);
};

export const sendForbidden = (res: Response, message = "Insufficient permissions") => {
  const body: ApiResponse = { success: false, message };
  return res.status(403).json(body);
};

export const parsePagination = (query: Record<string, unknown>) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
