import { Response } from "express";
import prisma from "../lib/prisma";
import logger from "../config/logger";
import { AuthenticatedRequest } from "../middleware/auth";

export async function getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const totalProducts = await prisma.product.count();
    const totalGallery = await prisma.gallery.count();
    const totalInquiries = await prisma.inquiry.count();
    
    const unreadInquiries = await prisma.inquiry.count({
      where: { status: "UNREAD" },
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaysInquiries = await prisma.inquiry.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Dashboard metrics retrieved successfully",
      data: {
        totalProducts,
        totalGallery,
        totalInquiries,
        unreadInquiries,
        todaysInquiries,
      },
    });
  } catch (error) {
    logger.error("GET stats error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve dashboard statistics" });
  }
}
