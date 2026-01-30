// Validation des payloads users avec Zod.
import { z } from "zod";

export const userRoleSchema = z.enum(["USER", "ADMIN"]);

export const createUserSchema = z.object({
  firstName: z.string().min(1, "firstName requis"),
  lastName: z.string().min(1, "lastName requis"),
  email: z.string().email("email invalide"),
  password: z.string().min(8, "mot de passe trop court"),
  role: userRoleSchema.optional()
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    firstName: z.string().min(1, "firstName requis").optional(),
    lastName: z.string().min(1, "lastName requis").optional(),
    email: z.string().email("email invalide").optional(),
    password: z.string().min(8, "mot de passe trop court").optional(),
    role: userRoleSchema.optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être renseigné"
  });
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().min(1).optional()
});
export type ListUsersQueryInput = z.infer<typeof listUsersQuerySchema>;
