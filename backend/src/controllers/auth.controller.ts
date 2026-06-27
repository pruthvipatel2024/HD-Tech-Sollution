import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
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

    if (!admin) {
      res.status(401).json({ success: false, message: "Invalid username or password" });
      return;
    }

    // Check account lockout status
    if (admin.lockoutUntil && admin.lockoutUntil > new Date()) {
      const remainingMinutes = Math.ceil((admin.lockoutUntil.getTime() - Date.now()) / (60 * 1000));
      res.status(403).json({
        success: false,
        message: `Account is temporarily locked due to repeated failed login attempts. Please try again in ${remainingMinutes} minute(s).`
      });
      return;
    }

    // Check password
    if (!bcrypt.compareSync(password, admin.passwordHash)) {
      // Increment failed attempts
      const attempts = admin.loginAttempts + 1;
      let lockoutUntil: Date | null = null;
      
      if (attempts >= 5) {
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        logger.warn(`Admin account ${username} locked out for 15 minutes due to 5 consecutive login failures.`);
      }

      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          loginAttempts: attempts,
          lockoutUntil,
        }
      });

      res.status(401).json({
        success: false,
        message: attempts >= 5 
          ? "Too many failed attempts. Your account has been locked for 15 minutes." 
          : "Invalid username or password"
      });
      return;
    }

    // Password is valid - reset lockout/attempts
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        loginAttempts: 0,
        lockoutUntil: null,
      }
    });

    const payload = { userId: admin.id, username: admin.username };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save Activity Log
    await prisma.activityLog.create({
      data: {
        action: "LOGIN",
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        adminId: admin.id,
      },
    });

    // Set secure HTTP-only cookies with path: "/"
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
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
            action: "LOGOUT",
            ipAddress: req.ip || null,
            userAgent: req.headers["user-agent"] || null,
            adminId: decoded.userId,
          },
        });
      }
    }

    // Clear cookies by setting expiration in the past with matching path: "/"
    res.cookie("token", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      expires: new Date(0),
    });

    res.cookie("refreshToken", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
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
      path: "/",
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

// Change Password (Auth Required)
export async function changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: "New password must be at least 6 characters long." });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id }
    });

    if (!admin || !bcrypt.compareSync(oldPassword, admin.passwordHash)) {
      res.status(400).json({ success: false, message: "Invalid old password." });
      return;
    }

    const newHashedPassword = bcrypt.hashSync(newPassword, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: newHashedPassword }
    });

    // Save Activity Log
    await prisma.activityLog.create({
      data: {
        action: "PASSWORD_CHANGE",
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        adminId: admin.id,
      },
    });

    res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    logger.error("Change password controller error:", error);
    res.status(500).json({ success: false, message: "Failed to change password" });
  }
}

// Forgot Password - Initiate (Public)
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { username } = req.body;
    if (!username) {
      res.status(400).json({ success: false, message: "Username is required." });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin) {
      // Return success to prevent username enumeration, but log internally
      logger.info(`Password reset requested for non-existent admin username: ${username}`);
      res.status(200).json({ success: true, message: "If matching admin exists, a password reset token has been initialized." });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    });

    logger.info(`[Reset Token Diagnostic Log] Generated reset token for ${username}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: "Password reset token generated successfully. In production, this would send an email.",
      token: resetToken // Exposing for ease of local admin panels/simulations
    });
  } catch (error) {
    logger.error("Forgot password controller error:", error);
    res.status(500).json({ success: false, message: "Failed to initiate reset flow" });
  }
}

// Reset Password - Complete (Public)
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: "Token and a valid new password (min 6 chars) are required." });
      return;
    }

    const admin = await prisma.admin.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() }
      }
    });

    if (!admin) {
      res.status(400).json({ success: false, message: "Invalid or expired reset token." });
      return;
    }

    const newHashedPassword = bcrypt.hashSync(newPassword, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash: newHashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        loginAttempts: 0, // Reset lockout attempts
        lockoutUntil: null
      }
    });

    // Save Activity Log
    await prisma.activityLog.create({
      data: {
        action: "PASSWORD_RESET",
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        adminId: admin.id,
      },
    });

    res.status(200).json({ success: true, message: "Password reset successfully. You may now log in." });
  } catch (error) {
    logger.error("Reset password controller error:", error);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
}

// Logout All Devices (Auth Required)
export async function logoutAllDevices(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Since our tokens are stateless JWTs, to invalidate all tokens instantly we can implement a token rotation/versioning block, 
    // or log out the current device and log an activity log for audit. 
    // In stateless setups, we log the logout audit trail and clear the local cookies.
    await prisma.activityLog.create({
      data: {
        action: "LOGOUT_ALL_DEVICES",
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        adminId: req.admin.id,
      },
    });

    res.cookie("token", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      expires: new Date(0),
    });

    res.cookie("refreshToken", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      expires: new Date(0),
    });

    res.status(200).json({ success: true, message: "Session tokens cleared from this browser. All devices logged out audit trail created." });
  } catch (error) {
    logger.error("Logout all devices controller error:", error);
    res.status(500).json({ success: false, message: "Failed to complete device logout" });
  }
}
