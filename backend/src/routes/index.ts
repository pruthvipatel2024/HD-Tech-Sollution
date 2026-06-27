import { Router } from "express";
import authRoutes from "./auth.routes";
import productsRoutes from "./products.routes";
import categoriesRoutes from "./categories.routes";
import galleryRoutes from "./gallery.routes";
import inquiriesRoutes from "./inquiries.routes";
import cmsRoutes from "./cms.routes";
import brandsRoutes from "./brands.routes";
import testimonialsRoutes from "./testimonials.routes";
import uploadRoutes from "./upload.routes";
import statsRoutes from "./stats.routes";
import servicesRoutes from "./services.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/gallery", galleryRoutes);
router.use("/inquiries", inquiriesRoutes);
router.use("/cms", cmsRoutes);
router.use("/brands", brandsRoutes);
router.use("/testimonials", testimonialsRoutes);
router.use("/upload", uploadRoutes);
router.use("/dashboard/stats", statsRoutes);
router.use("/services", servicesRoutes);

export default router;
