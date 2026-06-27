import { Request, Response } from "express";
import prisma from "../lib/prisma";
import logger from "../config/logger";
import { AuthenticatedRequest } from "../middleware/auth";

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

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, icon, description, category, isCore } = req.body;
    if (!name || !icon || !description || !category) {
      res.status(400).json({ success: false, message: "Missing required fields (name, icon, description, category)" });
      return;
    }

    const srv = await prisma.service.create({
      data: { name, icon, description, category, isCore: !!isCore },
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: srv,
    });
  } catch (error) {
    logger.error("Create service error:", error);
    res.status(500).json({ success: false, message: "Failed to create service" });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: "Service not found" });
      return;
    }

    await prisma.service.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
      data: existing,
    });
  } catch (error) {
    logger.error("Delete service error:", error);
    res.status(500).json({ success: false, message: "Failed to delete service" });
  }
}
