import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import logger from "./logger";
import swaggerDoc from "./swagger.json";

export function setupSwagger(app: Express): void {
  try {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
    logger.info("API Documentation successfully mounted at /api-docs");
  } catch (error) {
    logger.error("Failed to configure API documentation setup:", error);
  }
}
