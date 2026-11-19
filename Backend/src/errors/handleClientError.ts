import httpStatus from "http-status";
import { IGenericErrorResponse } from "../interfaces/common";

// MongoDB duplicate key violation (unique index, error code 11000)
const handleClientError = (error: any): IGenericErrorResponse => {
  const field = Object.keys(error?.keyValue || {})[0] || "unknown";

  return {
    statusCode: httpStatus.CONFLICT,
    message: "Duplicate value",
    errorMessages: [{ path: field, message: `${field} already exists` }],
  };
};

export default handleClientError;
