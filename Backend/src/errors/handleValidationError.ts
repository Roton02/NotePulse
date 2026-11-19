import mongoose from "mongoose";
import httpStatus from "http-status";
import { IGenericErrorMessage } from "../interfaces/error";
import { IGenericErrorResponse } from "../interfaces/common";

// Mongoose schema validation (required, maxlength, custom validators) and invalid ObjectId casts
const handleValidationError = (
  error: mongoose.Error.ValidationError | mongoose.Error.CastError
): IGenericErrorResponse => {
  let errorMessages: IGenericErrorMessage[];

  if (error instanceof mongoose.Error.ValidationError) {
    errorMessages = Object.values(error.errors).map((err) => ({
      path: err.path,
      message: err.message,
    }));
  } else {
    errorMessages = [{ path: error.path, message: error.message }];
  }

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: "Validation Error",
    errorMessages,
  };
};

export default handleValidationError;
