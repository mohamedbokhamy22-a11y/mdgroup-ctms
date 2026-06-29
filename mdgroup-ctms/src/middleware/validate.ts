// Prompt: "Create a Zod-based request validation middleware factory for Express that
// validates req.body, req.query, and req.params against provided Zod schemas."

import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const combined = z.object({
      body: schemas.body ?? z.any(),
      query: schemas.query ?? z.any(),
      params: schemas.params ?? z.any(),
    });
    combined.parse({ body: req.body, query: req.query, params: req.params });
    next();
  };
};
