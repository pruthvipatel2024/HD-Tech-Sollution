import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import apiRoutes from "./routes";
import logger from "./config/logger";
import { setupSwagger } from "./config/swagger";

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS Configuration enabling credentials for HTTP-only cookies
const allowedOrigins = [
  process.env.CLIENT_URL || "https://hdtechsolutions.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        logger.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
        callback(new Error("Not allowed by CORS policy"));
      }
    },
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});

app.use("/api", limiter);

// Request body parsers
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Expose static uploads directory to serve fallback local image links
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Mount API Docs UI
setupSwagger(app);

// Mount API routes under /api
app.use("/api", apiRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Global express error boundary intercepted:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An internal server error occurred",
    errors: err.errors || [],
  });
});

export default app;
