import httpStatus from "http-status";
import { Request, Response } from "express";
import { userServices } from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { users, meta } = await userServices.listUsers({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
  });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    meta,
    data: users,
  });
});

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.createUser(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User created successfully",
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getUserById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User retrieved successfully",
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.updateUser(req.params.id, req.body, req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await userServices.deleteUser(req.params.id, req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User deleted successfully",
  });
});

export const userControllers = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
