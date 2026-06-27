import { Router } from "express";
import { getStats } from "../controllers/stats.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth as any, getStats as any);

export default router;
