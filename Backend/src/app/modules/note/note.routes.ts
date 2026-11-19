import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserRole } from "../user/user.interface";
import { noteControllers } from "./note.controller";
import { NoteValidation } from "./note.validation";

const router = express.Router();

// Every note route needs a logged-in user. Ownership is checked in the service.
router.use(auth());

router.post("/", validateRequest(NoteValidation.createNoteSchema), noteControllers.createNote);
router.get("/", noteControllers.getMyNotes);
// Admin only. Declared before "/:id" so "all" is not read as a note ID.
router.get("/all", auth(UserRole.ADMIN), noteControllers.getAllNotes);
router.get("/:id", noteControllers.getNoteById);
router.patch("/:id", validateRequest(NoteValidation.updateNoteSchema), noteControllers.updateNote);
router.delete("/:id", noteControllers.deleteNote);

export const noteRoutes = router;
