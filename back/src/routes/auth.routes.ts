import { Router } from "express";
import { login, logout, refresh, register } from "../controllers/auth.controller.js";

const router = Router();

// Endpoints d'auth
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
