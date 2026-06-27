import { Router } from "express";
import { list, create, remove } from "../controllers/categories.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", list);
router.post("/", requireAuth as any, create as any);
router.delete("/:id", requireAuth as any, remove as any);

export default router;
