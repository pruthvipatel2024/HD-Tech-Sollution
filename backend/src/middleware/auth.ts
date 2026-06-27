import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";
import prisma from "../lib/prisma";
import logger from "../config/logger";

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
    username: string;
    role: {
      name: string;
      permissions: string[];
    };
  };
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts[0]?.trim();
    if (name) {
      cookies[name] = parts.slice(1).join("=").trim();
    }
  });
  return cookies;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.token;

    if (!token) {
      res.status(401).json({ success: false, message: "Access token is missing" });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({ success: false, message: "Expired or invalid session token" });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!admin) {
      res.status(401).json({ success: false, message: "Admin account not found" });
      return;
    }

    req.admin = {
      id: admin.id,
      username: admin.username,
      role: {
        name: admin.role.name,
        permissions: admin.role.permissions,
      },
    };

    next();
  } catch (error) {
    logger.error("Authentication middleware failure:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred" });
  }
}

export function checkPermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Unauthorized: authentication required." });
      return;
    }

    const { permissions } = req.admin.role;
    if (permissions.includes(permission) || permissions.includes("manage_all") || permissions.includes("*")) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: `Forbidden: you do not have the required permission (${permission}) to perform this action.`
      });
    }
  };
}
