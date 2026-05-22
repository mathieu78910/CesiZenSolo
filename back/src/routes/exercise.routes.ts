import { Router } from "express";
import { createPractice, listExercises } from "../controllers/exercise.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", listExercises);
router.post("/:exerciseId/practices", authenticateJWT, createPractice);

export default router;
