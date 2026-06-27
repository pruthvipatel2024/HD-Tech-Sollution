import { Response } from "express";
import prisma from "../lib/prisma";
import logger from "../config/logger";
import { AuthenticatedRequest } from "../middleware/auth";

export async function getActivityLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200, // Limit to last 200 log trails
      include: {
        admin: {
          select: { username: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Activity log trails retrieved successfully",
      data: logs,
    });
  } catch (error) {
    logger.error("GET activity logs failure:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve logs." });
  }
}
