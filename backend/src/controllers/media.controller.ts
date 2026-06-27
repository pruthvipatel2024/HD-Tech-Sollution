import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import prisma from "../lib/prisma";
import logger from "../config/logger";
import { AuthenticatedRequest } from "../middleware/auth";

const uploadToCloudinary = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "hd_tech_solutions" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    ).end(buffer);
  });
};

// Upload and register file in Media Library
export async function uploadAsset(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    let secureUrl = "";
    
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      logger.info("[Media Library] Uploading buffer to Cloudinary...");
      secureUrl = await uploadToCloudinary(file.buffer);
    } else {
      logger.warn("[Media Library] Cloudinary settings missing. Falling back to local storage.");

      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${Date.now()}-${sanitizedName}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, file.buffer);

      const host = req.get("host") || `localhost:${process.env.PORT || 5000}`;
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      secureUrl = `${protocol}://${host}/uploads/${fileName}`;
    }

    // Register asset in Media Library
    const asset = await prisma.mediaAsset.create({
      data: {
        filename: file.originalname,
        url: secureUrl,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    res.status(201).json({ success: true, message: "Asset uploaded and registered.", data: asset });
  } catch (error) {
    logger.error("Media upload failure:", error);
    res.status(500).json({ success: false, message: "Failed to upload and catalog media." });
  }
}

// Get all assets in Media Library
export async function getAssets(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const assets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, data: assets });
  } catch (error) {
    logger.error("Get assets failure:", error);
    res.status(500).json({ success: false, message: "Failed to query media library assets." });
  }
}

// Rename media asset file
export async function renameAsset(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { filename } = req.body;

    if (!filename) {
      res.status(400).json({ success: false, message: "New filename is required." });
      return;
    }

    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) {
      res.status(404).json({ success: false, message: "Asset not found." });
      return;
    }

    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: { filename },
    });

    res.status(200).json({ success: true, message: "Asset renamed successfully.", data: updated });
  } catch (error) {
    logger.error("Rename asset failure:", error);
    res.status(500).json({ success: false, message: "Failed to rename media asset." });
  }
}

// Delete media asset (removes local file and row)
export async function deleteAsset(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) {
      res.status(404).json({ success: false, message: "Asset not found." });
      return;
    }

    // Attempt to delete local file if it resides on this host
    if (asset.url.includes("/uploads/")) {
      const parts = asset.url.split("/uploads/");
      const filename = parts[parts.length - 1];
      if (filename) {
        const filePath = path.join(process.cwd(), "uploads", filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info(`[Media Library] Deleted local file: ${filePath}`);
        }
      }
    }

    await prisma.mediaAsset.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Media asset deleted successfully." });
  } catch (error) {
    logger.error("Delete asset failure:", error);
    res.status(500).json({ success: false, message: "Failed to delete media asset." });
  }
}
