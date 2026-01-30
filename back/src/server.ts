// Entrée principale de l'API Express.
// Rôle: configurer middlewares et monter les routes.
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Middleware JSON + cookies pour l'auth
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes d'authentification
app.use("/api/auth", authRoutes);
// Routes utilisateurs
app.use("/api/users", userRoutes);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
