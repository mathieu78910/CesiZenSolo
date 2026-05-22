import { Router } from "express";
import {
  createResource,
  deleteResource,
  getResourceById,
  listAppResources,
  listResources,
  toggleResourceLike,
  toggleResourceSave,
  updateResource
} from "../controllers/resource.controller.js";
import { authenticateJWT, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/public", listResources);
router.get("/public/:resourceId", getResourceById);
router.get("/feed", authenticateJWT, listAppResources);
router.post("/:resourceId/likes/toggle", authenticateJWT, toggleResourceLike);
router.post("/:resourceId/saves/toggle", authenticateJWT, toggleResourceSave);
router.post("/", authenticateJWT, requireRole("ADMIN"), createResource);
router.get("/", authenticateJWT, requireRole("ADMIN"), listResources);
router.get("/:resourceId", authenticateJWT, requireRole("ADMIN"), getResourceById);
router.patch("/:resourceId", authenticateJWT, requireRole("ADMIN"), updateResource);
router.delete("/:resourceId", authenticateJWT, requireRole("ADMIN"), deleteResource);

export default router;
