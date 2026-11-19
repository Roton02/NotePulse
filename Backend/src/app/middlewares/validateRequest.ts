import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

const validateRequest =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Replace body with parsed data so unknown fields never reach the database layer
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (err) {
      return next(err);
    }
  };

export default validateRequest;
