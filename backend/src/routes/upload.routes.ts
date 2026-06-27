import { Router } from "express";
import { upload } from "../controllers/upload.controller";
import { uploadMiddleware } from "../middleware/upload";

const router = Router();

// File upload endpoints mapping file uploader middleware
router.post("/", uploadMiddleware.single("file"), upload);

export default router;
