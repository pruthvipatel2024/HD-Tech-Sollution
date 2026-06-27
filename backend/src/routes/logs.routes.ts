import { Router } from "express";
import { getActivityLogs } from "../controllers/logs.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Protect logs fetching for auth admins
router.get("/", requireAuth as any, getActivityLogs as any);

export default router;
