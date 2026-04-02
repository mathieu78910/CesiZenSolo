import { z } from "zod";

const categoryLabelSchema = z.string().trim().min(1, "categorie invalide").max(50, "categorie trop longue");

export const createResourceSchema = z.object({
  title: z.string().trim().min(1, "titre requis").max(150, "titre trop long"),
  content: z.string().trim().min(1, "contenu requis"),
  resourceType: z.string().trim().min(1, "type requis").max(50, "type trop long"),
  categories: z.array(categoryLabelSchema).max(10, "trop de categories").optional().default([])
});
export type CreateResourceInput = z.infer<typeof createResourceSchema>;

export const updateResourceSchema = z
  .object({
    title: z.string().trim().min(1, "titre requis").max(150, "titre trop long").optional(),
    content: z.string().trim().min(1, "contenu requis").optional(),
    resourceType: z.string().trim().min(1, "type requis").max(50, "type trop long").optional(),
    categories: z.array(categoryLabelSchema).max(10, "trop de categories").optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit etre renseigne"
  });
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

export const listResourcesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().min(1).optional(),
  resourceType: z.string().trim().min(1).optional()
});
export type ListResourcesQueryInput = z.infer<typeof listResourcesQuerySchema>;
