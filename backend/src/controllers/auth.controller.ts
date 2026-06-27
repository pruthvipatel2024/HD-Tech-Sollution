import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyToken } from "../utils/token";
import { loginSchema } from "../validators";
import logger from "../config/logger";
import { AuthenticatedRequest, parseCookies } from "../middleware/auth";

const isProduction = process.env.NODE_ENV === "production";

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.errors.map((e) => e.message),
      });
      return;
    }

    const { username, password } = parseResult.data;

    const admin = await prisma.admin.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
      res.status(401).json({ success: false, message: "Invalid username or password" });
      return;
    }

    const payload = { userId: admin.id, username: admin.username };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save Activity Log
    await prisma.activityLog.create({
      data: {
        action: "LOGGED_IN",
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        adminId: admin.id,
      },
    });

    // Set secure HTTP-only cookies
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        username: admin.username,
        role: admin.role.name,
      },
    });
  } catch (error) {
    logger.error("Login controller error:", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.token;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        // Log logout event
        await prisma.activityLog.create({
          data: {
            action: "LOGGED_OUT",
            ipAddress: req.ip || null,
            userAgent: req.headers["user-agent"] || null,
            adminId: decoded.userId,
          },
        });
      }
    }

    // Clear cookies by setting expiration in the past
    res.cookie("token", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      expires: new Date(0),
    });

    res.cookie("refreshToken", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      expires: new Date(0),
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    logger.error("Logout controller error:", error);
    res.status(500).json({ success: false, message: "Failed to log out cleanly" });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const rt = cookies.refreshToken;

    if (!rt) {
      res.status(401).json({ success: false, message: "Refresh token is missing" });
      return;
    }

    const decoded = verifyToken(rt);
    if (!decoded) {
      res.status(401).json({ success: false, message: "Expired or invalid refresh token" });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!admin) {
      res.status(401).json({ success: false, message: "User session not found" });
      return;
    }

    const payload = { userId: admin.id, username: admin.username };
    const newAccessToken = signAccessToken(payload);

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.status(200).json({
      success: true,
      message: "Session token refreshed",
      data: {
        username: admin.username,
        role: admin.role.name,
      },
    });
  } catch (error) {
    logger.error("Session refresh error:", error);
    res.status(500).json({ success: false, message: "Failed to refresh session" });
  }
}

export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User session active",
      data: {
        id: req.admin.id,
        username: req.admin.username,
        role: req.admin.role.name,
        permissions: req.admin.role.permissions,
      },
    });
  } catch (error) {
    logger.error("Me controller error:", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
}
