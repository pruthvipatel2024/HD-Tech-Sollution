import { Router } from "express";
import { createReview, getApprovedReviews, adminGetReviews, adminUpdateReview, adminDeleteReview } from "../controllers/reviews.controller";
import { requireAuth, checkPermission } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/", createReview);
router.get("/", getApprovedReviews);

// Admin routes
router.get("/admin", requireAuth as any, checkPermission("REVIEW_APPR") as any, adminGetReviews as any);
router.put("/admin/:id", requireAuth as any, checkPermission("REVIEW_APPR") as any, adminUpdateReview as any);
router.delete("/admin/:id", requireAuth as any, checkPermission("REVIEW_APPR") as any, adminDeleteReview as any);

export default router;
