import { Router } from "express";
import { uploadAsset, getAssets, renameAsset, deleteAsset } from "../controllers/media.controller";
import { requireAuth } from "../middleware/auth";
import { uploadMiddleware } from "../middleware/upload";

const router = Router();

// All media endpoints are protected for authenticated admins
router.post("/upload", requireAuth as any, uploadMiddleware.single("file"), uploadAsset as any);
router.get("/", requireAuth as any, getAssets as any);
router.put("/:id", requireAuth as any, renameAsset as any);
router.delete("/:id", requireAuth as any, deleteAsset as any);

export default router;
