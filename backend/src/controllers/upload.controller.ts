import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import logger from "../config/logger";

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

export async function upload(req: Request, res: Response): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      logger.info("[Upload Controller] Uploading buffer to Cloudinary...");
      const secureUrl = await uploadToCloudinary(file.buffer);
      res.status(200).json({ success: true, secure_url: secureUrl });
    } else {
      logger.warn("[Upload Controller] Cloudinary settings missing. Falling back to local storage.");

      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${Date.now()}-${sanitizedName}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, file.buffer);

      // Compute dynamic backend base URL
      const host = req.get("host") || `localhost:${process.env.PORT || 5000}`;
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const localUrl = `${protocol}://${host}/uploads/${fileName}`;

      res.status(200).json({ success: true, secure_url: localUrl });
    }
  } catch (error) {
    logger.error("Upload controller failure:", error);
    res.status(500).json({ success: false, message: "Failed to upload image" });
  }
}
