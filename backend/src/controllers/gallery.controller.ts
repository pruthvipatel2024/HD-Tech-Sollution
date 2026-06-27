import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { gallerySchema } from "../validators";
import logger from "../config/logger";
import { AuthenticatedRequest } from "../middleware/auth";

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const list = await prisma.gallery.findMany({
      include: { images: true, service: true },
      orderBy: { order: "asc" },
    });

    const mappedList = list.map((item: any) => ({
      ...item,
      imageUrls: item.images.map((img: any) => img.url),
      service: item.service?.name || "",
    }));

    res.status(200).json({
      success: true,
      message: "Gallery items retrieved successfully",
      data: mappedList,
    });
  } catch (error) {
    logger.error("List gallery error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve gallery" });
  }
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parseResult = gallerySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.errors.map((e) => e.message),
      });
      return;
    }

    const { title, description, location, serviceId, imageUrls, beforeImageUrl, afterImageUrl, featured, order } = parseResult.data;

    // Check service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      res.status(404).json({ success: false, message: "Selected service does not exist" });
      return;
    }

    const nextOrder = order !== undefined ? order : (await prisma.gallery.count()) + 1;

    const item = await prisma.gallery.create({
      data: {
        title,
        description,
        location,
        serviceId,
        beforeImageUrl: beforeImageUrl || null,
        afterImageUrl: afterImageUrl || null,
        featured,
        order: nextOrder,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: { images: true, service: true },
    });

    await prisma.activityLog.create({
      data: {
        action: `CREATED_GALLERY_ITEM: ${item.title}`,
        adminId: req.admin!.id,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });

    const mappedItem = {
      ...item,
      imageUrls: item.images.map((img: any) => img.url),
      service: item.service?.name || "",
    };

    res.status(201).json({
      success: true,
      message: "Gallery item added successfully",
      data: mappedItem,
    });
  } catch (error) {
    logger.error("Create gallery item error:", error);
    res.status(500).json({ success: false, message: "Failed to create gallery item" });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const existing = await prisma.gallery.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: "Gallery item not found" });
      return;
    }

    await prisma.gallery.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        action: `DELETED_GALLERY_ITEM: ${existing.title}`,
        adminId: req.admin!.id,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Gallery item deleted successfully",
      data: existing,
    });
  } catch (error) {
    logger.error("Delete gallery item error:", error);
    res.status(500).json({ success: false, message: "Failed to delete gallery item" });
  }
}
