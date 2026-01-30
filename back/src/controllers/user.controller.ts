// Contrôleur des routes utilisateurs (CRUD).
// Rôle: gérer req/res, validations simples, et déléguer au service.
import {
  createUser as createUserService,
  deleteUser as deleteUserService,
  getUserById as getUserByIdService,
  listUsers as listUsersService,
  updateUser as updateUserService
} from "../services/user.service.js";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema
} from "../validators/user.validator.js";
import type {
  CreateUserInput,
  ListUsersQueryInput,
  UpdateUserInput
} from "../validators/user.validator.js";

// Vérifie l'identité d'un utilisateur via req.user/params.
// Utile pour des routes "me" ou actions restreintes.
function resolveTargetUserId(req, res) {
  const authUserId = req.user?.userId;
  if (!authUserId) {
    res.status(401).json({ message: "Non authentifié" });
    return null;
  }

  if (req.params?.userId) {
    const paramUserId = Number.parseInt(req.params.userId, 10);
    if (Number.isNaN(paramUserId)) {
      res.status(400).json({ message: "userId invalide" });
      return null;
    }
    if (paramUserId !== authUserId) {
      res.status(403).json({ message: "Accès interdit" });
      return null;
    }
    return paramUserId;
  }

  return authUserId;
}


// - getUserById(req, res):
//   - Lit l'ID dans l'URL
//   - Délègue au service
//   - Mappe les erreurs vers un HTTP status
async function getUserById(req, res) {
  // Validation du paramètre
  const userId = Number.parseInt(req.params.userId, 10);
  if (Number.isNaN(userId)) {
    return res.status(400).json({ message: "userId invalide" });
  }

  try {
    // Appel service (retourne uniquement les champs publics)
    const user = await getUserByIdService(userId);
    return res.status(200).json({ user });
  } catch (error) {
    // Erreur métier -> HTTP 404
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    // Erreur inattendue -> HTTP 500
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// - listUsers(req, res):
//   - pagination simple via ?page=1&limit=20
//   - recherche via ?search=...
async function listUsers(req, res) {
  try {
    // Validation des query params
    const parsed = listUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: "Query invalide", issues: parsed.error.issues });
    }

    const { page, limit, search } = parsed.data as ListUsersQueryInput;
    // Appel service (renvoie users + total)
    const result = await listUsersService({ page, limit, search });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// - createUser(req, res):
//   - valider email, password, firstName, lastName, role…
//   - 201 + user créé
//   - 409 si email déjà utilisé
async function createUser(req, res) {
  // Validation du body via Zod
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Body invalide", issues: parsed.error.issues });
  }

  try {
    // Le service gère l'unicité email + hash password
    const data: CreateUserInput = parsed.data;
    const user = await createUserService(data);
    return res.status(201).json({ user });
  } catch (error) {
    // Email déjà utilisé
    if (error instanceof Error && error.message === "EMAIL_IN_USE") {
      return res.status(409).json({ message: "Utilisateur déjà existant" });
    }
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    return res.status(500).json({ message: "Erreur serveur" });
  }
}



// - updateUser(req, res):
//   - Mise à jour partielle (patch)
//   - Hash du mot de passe si fourni
async function updateUser(req, res) {
  // Validation du paramètre
  const userId = Number.parseInt(req.params.userId, 10);
  if (Number.isNaN(userId)) {
    return res.status(400).json({ message: "userId invalide" });
  }

  // Validation du body via Zod
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Body invalide", issues: parsed.error.issues });
  }

  try {
    // Le service gère l'email unique + hash password
    const data: UpdateUserInput = parsed.data;
    const user = await updateUserService(userId, data);
    return res.status(200).json({ user });
  } catch (error) {
    // Email déjà utilisé
    if (error instanceof Error && error.message === "EMAIL_IN_USE") {
      return res.status(409).json({ message: "Utilisateur déjà existant" });
    }
    return res.status(500).json({ message: "Erreur serveur" });
  }
}



// - deleteUser(req, res):
//   - Supprime l'utilisateur par ID
async function deleteUser(req, res) {
  // Validation du paramètre
  const userId = Number.parseInt(req.params.userId, 10);
  if (Number.isNaN(userId)) {
    return res.status(400).json({ message: "userId invalide" });
  }

  try {
    // Suppression via service
    await deleteUserService(userId);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    return res.status(500).json({ message: "Erreur serveur" });
  }
}



// Note: ne jamais renvoyer passwordHash.
export { resolveTargetUserId, getUserById, listUsers, createUser, updateUser, deleteUser };
