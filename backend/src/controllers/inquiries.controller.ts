import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { inquirySchema, inquiryStatusSchema, inquiryNoteSchema } from "../validators";
import logger from "../config/logger";
import { AuthenticatedRequest } from "../middleware/auth";

export async function list(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const list = await prisma.inquiry.findMany({
      include: {
        attachments: true,
        service: true,
        notes: {
          include: {
            admin: {
              select: { username: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "Inquiries retrieved successfully",
      data: list,
    });
  } catch (error) {
    logger.error("List inquiries controller error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve inquiries" });
  }
}

export async function submit(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = inquirySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.errors.map((e) => e.message),
      });
      return;
    }

    const { customerName, mobileNumber, email, serviceId, message, attachments } = parseResult.data;

    // Check service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      res.status(404).json({ success: false, message: "Selected service does not exist" });
      return;
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        customerName,
        mobileNumber,
        email: email || null,
        serviceId,
        message,
        attachments: {
          create: attachments ? attachments.map((att) => ({ url: att.url, name: att.name })) : [],
        },
      },
      include: { attachments: true, service: true },
    });

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: inquiry,
    });
  } catch (error) {
    logger.error("Submit inquiry controller error:", error);
    res.status(500).json({ success: false, message: "Failed to submit inquiry" });
  }
}

export async function updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const parseResult = inquiryStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.errors.map((e) => e.message),
      });
      return;
    }

    const { status } = parseResult.data;

    const existing = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: "Inquiry not found" });
      return;
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: { status },
      include: {
        attachments: true,
        service: true,
        notes: {
          include: {
            admin: { select: { username: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `UPDATED_INQUIRY_STATUS to ${status} for Inquiry ID: ${id}`,
        adminId: req.admin!.id,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Inquiry status updated successfully",
      data: updated,
    });
  } catch (error) {
    logger.error("Update inquiry status error:", error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
}

export async function addNote(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const parseResult = inquiryNoteSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.errors.map((e) => e.message),
      });
      return;
    }

    const { text } = parseResult.data;

    const existing = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: "Inquiry not found" });
      return;
    }

    const note = await prisma.inquiryNote.create({
      data: {
        text,
        inquiryId: id,
        adminId: req.admin!.id,
      },
      include: {
        admin: {
          select: { username: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Note added successfully",
      data: note,
    });
  } catch (error) {
    logger.error("Add inquiry note error:", error);
    res.status(500).json({ success: false, message: "Failed to append note" });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const existing = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: "Inquiry not found" });
      return;
    }

    await prisma.inquiry.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        action: `DELETED_INQUIRY ID: ${id}`,
        adminId: req.admin!.id,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully",
      data: existing,
    });
  } catch (error) {
    logger.error("Delete inquiry controller error:", error);
    res.status(500).json({ success: false, message: "Failed to delete inquiry" });
  }
}
