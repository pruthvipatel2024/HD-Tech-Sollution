import { Request, Response } from "express";
import prisma from "../lib/prisma";
import logger from "../config/logger";
import { AuthenticatedRequest } from "../middleware/auth";

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const list = await prisma.brand.findMany({
      orderBy: { name: "asc" },
    });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    logger.error("List brands error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve brands" });
  }
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, logoUrl } = req.body;
    if (!name || !logoUrl) {
      res.status(400).json({ success: false, message: "Name and logo URL are required" });
      return;
    }

    const brand = await prisma.brand.create({
      data: { name, logoUrl },
    });

    res.status(201).json({ success: true, message: "Brand added successfully", data: brand });
  } catch (error) {
    logger.error("Create brand error:", error);
    res.status(500).json({ success: false, message: "Failed to add brand" });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Brand not found" });
      return;
    }
    await prisma.brand.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Brand deleted successfully", data: existing });
  } catch (error) {
    logger.error("Delete brand error:", error);
    res.status(500).json({ success: false, message: "Failed to delete brand" });
  }
}
