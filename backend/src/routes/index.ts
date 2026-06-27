import { Router } from "express";
import authRoutes from "./auth.routes";
import productsRoutes from "./products.routes";
import categoriesRoutes from "./categories.routes";
import galleryRoutes from "./gallery.routes";
import inquiriesRoutes from "./inquiries.routes";
import cmsRoutes from "./cms.routes";
import brandsRoutes from "./brands.routes";
import reviewsRoutes from "./reviews.routes";
import mediaRoutes from "./media.routes";
import statsRoutes from "./stats.routes";
import servicesRoutes from "./services.routes";
import healthRoutes from "./health.routes";
import logsRoutes from "./logs.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/gallery", galleryRoutes);
router.use("/inquiries", inquiriesRoutes);
router.use("/cms", cmsRoutes);
router.use("/brands", brandsRoutes);
router.use("/testimonials", reviewsRoutes); // Map reviews to /testimonials endpoint
router.use("/media", mediaRoutes); // Central Media Library
router.use("/dashboard/stats", statsRoutes);
router.use("/services", servicesRoutes);
router.use("/logs", logsRoutes); // Audit logs
router.use("/", healthRoutes); // Mount health, ready, version

export default router;
