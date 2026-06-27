import { Request, Response } from "express";
import prisma from "../lib/prisma";
import logger from "../config/logger";

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const list = await prisma.service.findMany({
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Services retrieved successfully",
      data: list,
    });
  } catch (error) {
    logger.error("List services error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve services" });
  }
}
