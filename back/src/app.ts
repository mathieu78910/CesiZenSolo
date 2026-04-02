import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import exerciseRoutes from "./routes/exercise.routes.js";
import resourceRoutes from "./routes/resource.routes.js";
import userRoutes from "./routes/user.routes.js";

export function createApp() {
  const app = express();

  const allowedOrigins = (process.env.FRONT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    return next();
  });

  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/exercises", exerciseRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/resources", resourceRoutes);

  return app;
}

