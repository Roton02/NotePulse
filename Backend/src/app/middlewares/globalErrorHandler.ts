import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { ZodError } from "zod";
import config from "../../config";
import ApiError from "../../errors/ApiErrors";
import handleClientError from "../../errors/handleClientError";
import handleValidationError from "../../errors/handleValidationError";
import handleZodError from "../../errors/handleZodError";
import { IGenericErrorMessage } from "../../interfaces/error";

const GlobalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message: string = error?.message || "Something went wrong!";
  let errorMessages: IGenericErrorMessage[] = [];

  if (error instanceof ZodError) {
    const simplified = handleZodError(error);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorMessages = simplified.errorMessages;
  } else if (
    error instanceof mongoose.Error.ValidationError ||
    error instanceof mongoose.Error.CastError
  ) {
    const simplified = handleValidationError(error);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorMessages = simplified.errorMessages;
  } else if (error?.code === 11000) {
    const simplified = handleClientError(error);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorMessages = simplified.errorMessages;
  } else if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error?.type === "entity.parse.failed") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Malformed JSON in request body";
  } else if (error?.type === "entity.too.large") {
    statusCode = httpStatus.REQUEST_ENTITY_TOO_LARGE;
    message = "Request body is too large";
  }

  // Never leak internal details for server errors in production
  if (statusCode === httpStatus.INTERNAL_SERVER_ERROR && config.env === "production") {
    message = "Internal server error";
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
  });
};

export default GlobalErrorHandler;
