import { Request, Response } from "express";
import prisma from "../lib/prisma";
import logger from "../config/logger";
import { AuthenticatedRequest } from "../middleware/auth";

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const list = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    logger.error("List testimonials error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve testimonials" });
  }
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { customerName, role, content, rating, avatarUrl } = req.body;
    if (!customerName || !content) {
      res.status(400).json({ success: false, message: "Customer name and review content are required" });
      return;
    }

    const test = await prisma.testimonial.create({
      data: {
        customerName,
        role: role || null,
        content,
        rating: rating !== undefined ? Number(rating) : 5,
        avatarUrl: avatarUrl || null,
      },
    });

    res.status(201).json({ success: true, message: "Testimonial added successfully", data: test });
  } catch (error) {
    logger.error("Create testimonial error:", error);
    res.status(500).json({ success: false, message: "Failed to add testimonial" });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Testimonial not found" });
      return;
    }
    await prisma.testimonial.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Testimonial deleted successfully", data: existing });
  } catch (error) {
    logger.error("Delete testimonial error:", error);
    res.status(500).json({ success: false, message: "Failed to delete testimonial" });
  }
}
