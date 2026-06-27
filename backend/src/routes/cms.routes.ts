import { Router } from "express";
import { get, update } from "../controllers/cms.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", get);
router.put("/", requireAuth as any, update as any);

export default router;
