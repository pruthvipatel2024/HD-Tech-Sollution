import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { productSchema } from "../validators";
import logger from "../config/logger";
import { AuthenticatedRequest } from "../middleware/auth";

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const { categoryId, search, sort } = req.query;

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId as string;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "name_asc") {
      orderBy = { name: "asc" };
    }

    const list = await prisma.product.findMany({
      where,
      include: { images: true, category: true },
      orderBy,
    });

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: list,
    });
  } catch (error) {
    logger.error("List products controller error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve products" });
  }
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parseResult = productSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.errors.map((e) => e.message),
      });
      return;
    }

    const { name, description, price, availability, categoryId, imageUrls } = parseResult.data;

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(404).json({ success: false, message: "Selected category does not exist" });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        availability,
        categoryId,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: { images: true, category: true },
    });

    // Save Activity Log
    await prisma.activityLog.create({
      data: {
        action: `CREATED_PRODUCT: ${product.name}`,
        adminId: req.admin!.id,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    logger.error("Create product controller error:", error);
    res.status(500).json({ success: false, message: "Failed to create product" });
  }
}

export async function update(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const parseResult = productSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.errors.map((e) => e.message),
      });
      return;
    }

    const { name, description, price, availability, categoryId, imageUrls } = parseResult.data;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    // Clear old images
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        availability,
        categoryId,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: { images: true, category: true },
    });

    // Save Activity Log
    await prisma.activityLog.create({
      data: {
        action: `UPDATED_PRODUCT: ${updatedProduct.name}`,
        adminId: req.admin!.id,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    logger.error("Update product controller error:", error);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    await prisma.product.delete({
      where: { id },
    });

    // Save Activity Log
    await prisma.activityLog.create({
      data: {
        action: `DELETED_PRODUCT: ${existingProduct.name}`,
        adminId: req.admin!.id,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: existingProduct,
    });
  } catch (error) {
    logger.error("Delete product controller error:", error);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
}
