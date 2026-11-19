import httpStatus from "http-status";
import { Request, Response } from "express";
import { authServices } from "./auth.service";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.register(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.login(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Login successful",
    data: result,
  });
});

const me = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.getMe(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile retrieved successfully",
    data: result,
  });
});

export const authControllers = {
  register,
  login,
  me,
};
