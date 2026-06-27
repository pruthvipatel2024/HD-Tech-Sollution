import { Router } from "express";
import { list, create, update, remove } from "../controllers/products.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", list);
router.post("/", requireAuth as any, create as any);
router.patch("/:id", requireAuth as any, update as any);
router.delete("/:id", requireAuth as any, remove as any);

export default router;
