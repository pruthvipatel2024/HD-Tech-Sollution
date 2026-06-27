import { Router } from "express";
import { login, logout, refresh, me, changePassword, forgotPassword, resetPassword, logoutAllDevices } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", requireAuth as any, me as any);
router.post("/change-password", requireAuth as any, changePassword as any);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout-all", requireAuth as any, logoutAllDevices as any);

export default router;
