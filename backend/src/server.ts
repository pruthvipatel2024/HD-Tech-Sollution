import dotenv from "dotenv";

// Load environment variables before any other modules import prisma client
dotenv.config();

import app from "./app";
import logger from "./config/logger";
import prisma from "./lib/prisma";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    logger.info("Connecting to Neon PostgreSQL database...");
    await prisma.$connect();
    logger.info("Database connection successfully established.");

    app.listen(PORT, () => {
      logger.info(`Backend server is running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
      logger.info(`API endpoints available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error("Fatal: failed to establish server listener due to DB error:", error);
    process.exit(1);
  }
}

startServer();
