import httpStatus from "http-status";
import { Request, Response } from "express";
import { noteServices } from "./note.service";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";

const createNote = catchAsync(async (req: Request, res: Response) => {
  const result = await noteServices.createNote(req.user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Note created successfully",
    data: result,
  });
});

const getMyNotes = catchAsync(async (req: Request, res: Response) => {
  const { notes, meta } = await noteServices.listOwnNotes(req.user.id, req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Notes retrieved successfully",
    meta,
    data: notes,
  });
});

const getAllNotes = catchAsync(async (req: Request, res: Response) => {
  const { notes, meta } = await noteServices.listAllNotes(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All notes retrieved successfully",
    meta,
    data: notes,
  });
});

const getNoteById = catchAsync(async (req: Request, res: Response) => {
  const result = await noteServices.getNote(req.params.id, { id: req.user.id, role: req.user.role });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Note retrieved successfully",
    data: result,
  });
});

const updateNote = catchAsync(async (req: Request, res: Response) => {
  const result = await noteServices.updateNote(req.params.id, req.user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Note updated successfully",
    data: result,
  });
});

const deleteNote = catchAsync(async (req: Request, res: Response) => {
  await noteServices.deleteNote(req.params.id, req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Note deleted successfully",
  });
});

export const noteControllers = {
  createNote,
  getMyNotes,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
};
