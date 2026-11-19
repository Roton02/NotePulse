import httpStatus from "http-status";
import { Request, Response } from "express";
import { postServices } from "./post.service";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";

const createPost = catchAsync(async (req: Request, res: Response) => {
  const result = await postServices.createPost(req.user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Post created successfully",
    data: result,
  });
});

const getPostsByUser = catchAsync(async (req: Request, res: Response) => {
  const { posts, meta } = await postServices.getPostsByUser(req.params.userId, req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User posts retrieved successfully",
    meta,
    data: posts,
  });
});

export const postControllers = {
  createPost,
  getPostsByUser,
};
