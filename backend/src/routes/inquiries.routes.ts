import { Router } from "express";
import { list, submit, updateStatus, addNote, remove } from "../controllers/inquiries.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", submit);
router.get("/", requireAuth as any, list as any);
router.patch("/:id", requireAuth as any, updateStatus as any);
router.post("/:id/notes", requireAuth as any, addNote as any);
router.delete("/:id", requireAuth as any, remove as any);

export default router;
