# Bonnes pratiques de développement — CESIZen

## 1. Architecture MVC

Le projet backend suit le pattern **MVC** (Model-View-Controller) adapté à une API REST :

```
back/src/
├── controllers/    ← Logique de traitement des requêtes HTTP (C)
├── services/       ← Logique métier réutilisable
├── routes/         ← Définition des routes Express (point d'entrée)
├── middlewares/    ← Authentification, validation, gestion d'erreurs
├── validators/     ← Schémas Zod pour valider les entrées
└── utils/          ← Fonctions utilitaires partagées

back/prisma/
└── schema.prisma   ← Modèle de données (M — Model)
```

**Règle :** les contrôleurs ne contiennent pas de logique métier complexe — ils délèguent aux services. Les services ne font pas de réponse HTTP directe.

---

## 2. Variables d'environnement

### Principe fondamental

**Aucun secret ne doit jamais être commité dans Git.**

| ✅ Correct | ❌ Interdit |
|---|---|
| `process.env.JWT_ACCESS_SECRET` | `const secret = "mon_secret_hardcoded"` |
| Valeurs dans `.env` (non versionné) | Secrets dans `config.ts` commité |
| Secrets GitHub Actions | Secrets en clair dans `cd.yml` |

### Fichiers d'environnement

| Fichier | Versionné | Usage |
|---|---|---|
| `.env.example` / `.env.prod.example` | Oui | Template documentant les variables requises |
| `.env` | **Non** | Développement local |
| `.env.prod` | **Non** | Production (sur le serveur uniquement) |

### Variables requises (backend)

```env
DATABASE_URL=          # URL de connexion PostgreSQL
JWT_ACCESS_SECRET=     # Secret de signature des access tokens
JWT_REFRESH_SECRET=    # Secret de signature des refresh tokens
JWT_ACCESS_EXPIRES=    # Durée de vie access token (ex: 15m)
JWT_REFRESH_EXPIRES=   # Durée de vie refresh token (ex: 7d)
FRONT_ORIGIN=          # URL du frontend pour CORS
PORT=                  # Port d'écoute de l'API
```

---

## 3. Logs applicatifs

### Niveaux de log

| Niveau | Usage | Exemple |
|---|---|---|
| `INFO` | Événements normaux | Démarrage du serveur, requête entrante |
| `WARN` | Situation anormale mais non bloquante | Tentative de connexion échouée |
| `ERROR` | Erreur fonctionnelle ou technique | Exception non gérée, base de données inaccessible |

### Règles de logging

- **Ne jamais logger de données personnelles** (email, mot de passe, token)
- Logger le code HTTP, la méthode et la route — pas les paramètres utilisateur
- En production, les messages d'erreur renvoyés à l'utilisateur sont génériques (pas de stack trace exposée)

```typescript
// ✅ Correct
console.error(`[ERROR] POST /api/auth/login — 401 — Invalid credentials`);

// ❌ Interdit
console.log(`Login attempt for user: ${email} with password: ${password}`);
```

---

## 4. Naming conventions

### TypeScript / JavaScript

| Élément | Convention | Exemple |
|---|---|---|
| Variables, fonctions | camelCase | `getUserById`, `accessToken` |
| Classes, types, interfaces | PascalCase | `UserController`, `JwtPayload` |
| Constantes globales | SCREAMING_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS` |
| Fichiers | kebab-case | `user-controller.ts`, `auth-middleware.ts` |
| Variables d'environnement | SCREAMING_SNAKE_CASE | `JWT_ACCESS_SECRET` |

### Base de données (Prisma)

| Élément | Convention | Exemple |
|---|---|---|
| Modèles | PascalCase | `User`, `UserExercise` |
| Champs Prisma | camelCase | `userId`, `passwordHash` |
| Colonnes SQL (map) | snake_case | `user_id`, `password_hash` |

### API REST

| Méthode | Usage |
|---|---|
| `GET /api/resource` | Lister les ressources |
| `GET /api/resource/:id` | Récupérer une ressource |
| `POST /api/resource` | Créer une ressource |
| `PUT /api/resource/:id` | Mettre à jour une ressource |
| `DELETE /api/resource/:id` | Supprimer une ressource |

---

## 5. Git

### Convention de commits (Conventional Commits)

```
<type>(<scope>): <description courte en français>

Types :
  feat     — nouvelle fonctionnalité
  fix      — correction de bug
  docs     — documentation uniquement
  style    — formatage (sans impact fonctionnel)
  refactor — refactorisation sans ajout de fonctionnalité ni correction
  test     — ajout ou modification de tests
  chore    — tâches de maintenance (dépendances, CI, etc.)

Exemples :
  feat(auth): ajouter le refresh token automatique
  fix(api): corriger la validation du champ email
  docs: mettre à jour le plan de déploiement
  chore: mettre à jour les dépendances npm
```

### Convention de branches

```
main          ← Production (protégée, merge uniquement via PR)
develop       ← Intégration continue
feature/<nom> ← Nouvelle fonctionnalité (ex: feature/admin-dashboard)
fix/<nom>     ← Correction de bug (ex: fix/login-error-500)
```

---

## 6. Tests

### Backend (Vitest)

- Les tests unitaires se trouvent dans `back/src/**/*.test.ts`
- Lancer les tests : `npm test` dans le répertoire `back/`
- Les tests doivent être indépendants (pas de dépendance à une BDD live en CI)

### Validation des entrées

Toutes les entrées utilisateur sont validées avec **Zod** avant traitement :

```typescript
// Exemple de validator
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

La validation échoue avec un code HTTP `400` et un message d'erreur explicite — jamais de données non validées ne transitent vers la base de données.

---

## 7. Sécurité dans le code

### Checklist avant chaque PR

- [ ] Aucun secret en dur dans le code
- [ ] Toutes les routes sensibles ont le middleware d'authentification
- [ ] Les entrées utilisateur sont validées avec Zod
- [ ] Les requêtes DB passent par Prisma (pas de SQL brut)
- [ ] Les erreurs ne révèlent pas de détails techniques à l'utilisateur
- [ ] `npm audit` sans vulnérabilité de niveau `high` ou `critical`
