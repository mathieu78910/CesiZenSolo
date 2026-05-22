import { Router } from "express";
import { forgotPassword, login, logout, refresh, register } from "../controllers/auth.controller.js";

const router = Router();

// Endpoints d'auth
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
