import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/health", async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "healthy", database: "connected", timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ status: "unhealthy", database: "disconnected", error: String(error) });
  }
});

router.get("/ready", async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).send("OK");
  } catch (error) {
    res.status(503).send("Database not ready");
  }
});

router.get("/version", (req: Request, res: Response) => {
  res.status(200).json({ version: "1.0.0", environment: process.env.NODE_ENV || "development" });
});

export default router;
