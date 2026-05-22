import type { Request, Response } from "express";
import {
  createResource as createResourceService,
  deleteResource as deleteResourceService,
  getResourceById as getResourceByIdService,
  listResources as listResourcesService,
  toggleResourceLike as toggleResourceLikeService,
  toggleResourceSave as toggleResourceSaveService,
  updateResource as updateResourceService
} from "../services/resource.service.js";
import {
  createResourceSchema,
  listResourcesQuerySchema,
  type ListResourcesQueryInput,
  type UpdateResourceInput,
  updateResourceSchema
} from "../validators/resource.validator.js";

function parseResourceId(req: Request, res: Response) {
  const resourceId = Number.parseInt(req.params.resourceId, 10);
  if (Number.isNaN(resourceId)) {
    res.status(400).json({ message: "resourceId invalide" });
    return null;
  }

  return resourceId;
}

export async function listResources(req: Request, res: Response) {
  const parsed = listResourcesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Query invalide", issues: parsed.error.issues });
  }

  const query: ListResourcesQueryInput = parsed.data;
  const result = await listResourcesService(query);
  return res.status(200).json(result);
}

export async function listAppResources(req: Request, res: Response) {
  const parsed = listResourcesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Query invalide", issues: parsed.error.issues });
  }

  const query: ListResourcesQueryInput = parsed.data;
  const result = await listResourcesService(query, { currentUserId: req.user.userId });
  return res.status(200).json(result);
}

export async function getResourceById(req: Request, res: Response) {
  const resourceId = parseResourceId(req, res);
  if (!resourceId) {
    return;
  }

  try {
    const resource = await getResourceByIdService(resourceId);
    return res.status(200).json({ resource });
  } catch (error) {
    if (error instanceof Error && error.message === "RESOURCE_NOT_FOUND") {
      return res.status(404).json({ message: "Article introuvable" });
    }
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function createResource(req: Request, res: Response) {
  const parsed = createResourceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Body invalide", issues: parsed.error.issues });
  }

  try {
    const resource = await createResourceService(parsed.data);
    return res.status(201).json({ resource });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function updateResource(req: Request, res: Response) {
  const resourceId = parseResourceId(req, res);
  if (!resourceId) {
    return;
  }

  const parsed = updateResourceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Body invalide", issues: parsed.error.issues });
  }

  try {
    const data: UpdateResourceInput = parsed.data;
    const resource = await updateResourceService(resourceId, data);
    return res.status(200).json({ resource });
  } catch (error) {
    if (error instanceof Error && error.message === "RESOURCE_NOT_FOUND") {
      return res.status(404).json({ message: "Article introuvable" });
    }
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function deleteResource(req: Request, res: Response) {
  const resourceId = parseResourceId(req, res);
  if (!resourceId) {
    return;
  }

  try {
    await deleteResourceService(resourceId);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === "RESOURCE_NOT_FOUND") {
      return res.status(404).json({ message: "Article introuvable" });
    }
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function toggleResourceLike(req: Request, res: Response) {
  const resourceId = parseResourceId(req, res);
  if (!resourceId) {
    return;
  }

  try {
    const resource = await toggleResourceLikeService(resourceId, req.user.userId);
    return res.status(200).json({ resource });
  } catch (error) {
    if (error instanceof Error && error.message === "RESOURCE_NOT_FOUND") {
      return res.status(404).json({ message: "Article introuvable" });
    }
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function toggleResourceSave(req: Request, res: Response) {
  const resourceId = parseResourceId(req, res);
  if (!resourceId) {
    return;
  }

  try {
    const resource = await toggleResourceSaveService(resourceId, req.user.userId);
    return res.status(200).json({ resource });
  } catch (error) {
    if (error instanceof Error && error.message === "RESOURCE_NOT_FOUND") {
      return res.status(404).json({ message: "Article introuvable" });
    }
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
