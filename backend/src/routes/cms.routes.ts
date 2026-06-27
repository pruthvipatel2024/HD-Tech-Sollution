import { Router } from "express";
import { get, update, adminGetSettings } from "../controllers/cms.controller";
import { requireAuth, checkPermission } from "../middleware/auth";

const router = Router();

router.get("/", get);
router.get("/admin", requireAuth as any, checkPermission("CMS_EDIT") as any, adminGetSettings as any);
router.put("/", requireAuth as any, checkPermission("CMS_EDIT") as any, update as any);

export default router;
