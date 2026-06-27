import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import logger from "./logger";

export function setupSwagger(app: Express): void {
  try {
    const swaggerDocPath = path.join(__dirname, "swagger.json");
    
    if (fs.existsSync(swaggerDocPath)) {
      const swaggerDoc = JSON.parse(fs.readFileSync(swaggerDocPath, "utf-8"));
      
      // Serve swagger documentation UI
      app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
      logger.info("API Documentation successfully mounted at /api-docs");
    } else {
      logger.warn(`[Swagger] Documentation json not found at: ${swaggerDocPath}`);
    }
  } catch (error) {
    logger.error("Failed to configure API documentation setup:", error);
  }
}
