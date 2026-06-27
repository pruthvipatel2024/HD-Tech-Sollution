import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { cmsSchema } from "../validators";
import logger from "../config/logger";
import { AuthenticatedRequest } from "../middleware/auth";

export async function get(req: Request, res: Response): Promise<void> {
  try {
    const settings = await prisma.cmsSetting.findMany();
    
    // Convert array of key-value pairs into a single map object
    const config: Record<string, string> = {};
    settings.forEach((s) => {
      config[s.key] = s.value;
    });

    res.status(200).json({
      success: true,
      message: "CMS configurations retrieved successfully",
      data: config,
    });
  } catch (error) {
    logger.error("GET CMS settings error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve configurations" });
  }
}

export async function update(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parseResult = cmsSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.errors.map((e) => e.message),
      });
      return;
    }

    const { key, value } = parseResult.data;

    const setting = await prisma.cmsSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    await prisma.activityLog.create({
      data: {
        action: `UPDATED_CMS_CONFIG key: ${key}`,
        adminId: req.admin!.id,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });

    res.status(200).json({
      success: true,
      message: "CMS configuration updated successfully",
      data: setting,
    });
  } catch (error) {
    logger.error("PUT CMS settings error:", error);
    res.status(500).json({ success: false, message: "Failed to update configuration" });
  }
}

export async function adminGetSettings(req: Request, res: Response): Promise<void> {
  try {
    const settings = await prisma.cmsSetting.findMany({
      orderBy: { key: "asc" }
    });
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    logger.error("Admin GET CMS settings error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve configurations list" });
  }
}
