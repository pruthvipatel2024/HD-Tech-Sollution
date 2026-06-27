import { Request, Response } from "express";
import prisma from "../lib/prisma";
import logger from "../config/logger";
import { AuthenticatedRequest } from "../middleware/auth";

// Public: Submit a review
export async function createReview(req: Request, res: Response): Promise<void> {
  try {
    const { customerName, city, content, rating, serviceUsed, avatarUrl } = req.body;
    
    if (!customerName || !content || !rating) {
      res.status(400).json({ success: false, message: "Customer name, rating, and review content are required." });
      return;
    }

    const review = await prisma.testimonial.create({
      data: {
        customerName,
        city: city || null,
        content,
        rating: Number(rating),
        serviceUsed: serviceUsed || null,
        avatarUrl: avatarUrl || null,
        approved: false, // Must be approved by admin before displaying
      },
    });

    res.status(201).json({
      success: true,
      message: "Thank you for your feedback! Your review has been submitted and is pending administrator approval.",
      data: review,
    });
  } catch (error) {
    logger.error("Create review error:", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred while saving your review." });
  }
}

// Public: Get approved reviews for homepage
export async function getApprovedReviews(req: Request, res: Response): Promise<void> {
  try {
    const reviews = await prisma.testimonial.findMany({
      where: { approved: true },
      orderBy: { reviewDate: "desc" },
    });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    logger.error("Get approved reviews error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch client testimonials." });
  }
}

// Admin: Get all reviews (pending, approved, featured)
export async function adminGetReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const reviews = await prisma.testimonial.findMany({
      orderBy: { reviewDate: "desc" },
    });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    logger.error("Admin get reviews error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews list." });
  }
}

// Admin: Update review details or approval status
export async function adminUpdateReview(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { customerName, city, content, rating, serviceUsed, approved, featured, replyFromBusiness } = req.body;

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Review not found." });
      return;
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        customerName: customerName !== undefined ? customerName : existing.customerName,
        city: city !== undefined ? city : existing.city,
        content: content !== undefined ? content : existing.content,
        rating: rating !== undefined ? Number(rating) : existing.rating,
        serviceUsed: serviceUsed !== undefined ? serviceUsed : existing.serviceUsed,
        approved: approved !== undefined ? Boolean(approved) : existing.approved,
        featured: featured !== undefined ? Boolean(featured) : existing.featured,
        replyFromBusiness: replyFromBusiness !== undefined ? replyFromBusiness : existing.replyFromBusiness,
      },
    });

    res.status(200).json({ success: true, message: "Review updated successfully.", data: updated });
  } catch (error) {
    logger.error("Admin update review error:", error);
    res.status(500).json({ success: false, message: "Failed to update review." });
  }
}

// Admin: Delete review
export async function adminDeleteReview(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Review not found." });
      return;
    }

    await prisma.testimonial.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Review deleted successfully." });
  } catch (error) {
    logger.error("Admin delete review error:", error);
    res.status(500).json({ success: false, message: "Failed to delete review." });
  }
}
