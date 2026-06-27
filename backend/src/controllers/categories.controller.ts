import { Request, Response } from "express";
import prisma from "../lib/prisma";
import logger from "../config/logger";
import { AuthenticatedRequest } from "../middleware/auth";

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const list = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: list,
    });
  } catch (error) {
    logger.error("List categories error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve categories" });
  }
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: "Category name is required" });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const category = await prisma.category.create({
      data: { name, slug },
    });

    await prisma.activityLog.create({
      data: {
        action: `CREATED_CATEGORY: ${category.name}`,
        adminId: req.admin!.id,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error: any) {
    logger.error("Create category error:", error);
    if (error.code === "P2002") {
      res.status(400).json({ success: false, message: "Category name or slug already exists" });
      return;
    }
    res.status(500).json({ success: false, message: "Failed to create category" });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }

    await prisma.category.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        action: `DELETED_CATEGORY: ${existing.name}`,
        adminId: req.admin!.id,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: existing,
    });
  } catch (error) {
    logger.error("Delete category error:", error);
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
}
