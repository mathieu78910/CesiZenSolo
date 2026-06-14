# Plan de déploiement — CESIZen

## 1. Vue d'ensemble

CESIZen est une application de santé mentale composée de :

- **Backend** : API REST Node.js/TypeScript (Express + Prisma + PostgreSQL)
- **Frontend** : Application React (Vite) servie par Nginx
- **Base de données** : PostgreSQL 16
- **Reverse proxy** : Traefik v3 (TLS Let's Encrypt automatique)

---

## 2. Environnements

| Environnement     | Objectif              | URL                                                                  | Déclencheur        |
| ----------------- | --------------------- | -------------------------------------------------------------------- | ------------------ |
| **Développement** | Développement local   | `http://localhost:3000`                                              | Manuel             |
| **Staging**       | Validation avant prod | branche `develop`                                                    | Push sur `develop` |
| **Production**    | Utilisateurs finaux   | `https://cesizen.mathieu-monnie.switzerlandnorth.cloudapp.azure.com` | Push sur `main`    |

### 2.1 Environnement de développement (local)

- Docker non requis : on lance chaque service directement
- Base de données PostgreSQL locale (port 5433 via Docker)
- Variables dans les fichiers `.env` locaux (non versionnés)

**Lancer le développement :**

```bash
# Terminal 1 — Base de données
docker compose up db

# Terminal 2 — API
cd back && npm run dev

# Terminal 3 — Frontend
cd web && npm run dev
```

### 2.2 Environnement de staging

- Identique à la production en termes de configuration Docker
- Utilisé pour valider le pipeline CI avant promotion sur `main`
- Le pipeline CI (`.github/workflows/ci.yml`) s'exécute sur la branche `develop`

### 2.3 Environnement de production

- Serveur VPS Azure (Switzerland North)
- Docker Compose avec Traefik pour le routage HTTPS
- Images Docker téléchargées depuis GitHub Container Registry (ghcr.io)
- Déploiement automatisé par le pipeline CD (`.github/workflows/cd.yml`)

---

## 3. Architecture technique

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  Serveur VPS Azure (Ubuntu 22.04)                       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Traefik v3 (reverse proxy + TLS Let's Encrypt) │    │
│  │  Port 80 → redirect HTTPS                       │    │
│  │  Port 443 → HTTPS                               │    │
│  └──────────────┬──────────────────────────────────┘    │
│                 │ réseau Docker : cesizen_net           │
│         ┌───────┴────────┐                              │
│         ▼                ▼                              │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │  cesizen-   │  │  cesizen-   │                       │
│  │  web        │  │  api        │                       │
│  │  (Nginx)    │  │  (Express)  │                       │
│  │  :80        │  │  :3000      │                       │
│  └─────────────┘  └──────┬──────┘                       │
│                           │                             │
│                    ┌──────▼──────┐                      │
│                    │  cesizen-db │                      │
│                    │ (Postgres)  │                      │
│                    │  :5432      │                      │
│                    └─────────────┘                      │
└─────────────────────────────────────────────────────────┘

GitHub Actions (CI/CD)
    │
    ├── CI (ci.yml) : push/PR → tests → typecheck → build web
    └── CD (cd.yml) : déclenché par la fin du CI sur main, uniquement
                       si conclusion == success → build images → push GHCR
                       → SSH deploy
```

**Routage Traefik :**

- `https://cesizen.example.com/api/*` → service `cesizen-api:3000`
- `https://cesizen.example.com/*` → service `cesizen-web:80`

---

## 4. Pipeline CI/CD

### 4.1 Pipeline CI — `.github/workflows/ci.yml`

Déclenché sur chaque **push** et **pull request** vers `main` ou `develop`.

| Étape            | Description                            |
| ---------------- | -------------------------------------- |
| Checkout         | Récupération du code source            |
| Setup Node.js 22 | Configuration de l'environnement Node  |
| npm ci (API)     | Installation des dépendances backend   |
| TypeCheck        | Vérification des types TypeScript      |
| Tests unitaires  | Exécution de Vitest                    |
| npm ci (Web)     | Installation des dépendances frontend  |
| Build Web        | Vérification que le build Vite réussit |

### 4.2 Pipeline CD — `.github/workflows/cd.yml`

Déclenché par l'événement `workflow_run` à la fin du pipeline CI sur `main`.
Le job `build-and-push` ne s'exécute **que si** `github.event.workflow_run.conclusion == 'success'` :
si le typecheck, les tests ou le build web échouent dans le CI, le CD ne se lance pas et **rien n'est déployé**.

Le code construit et déployé est celui du commit exact validé par le CI
(`ref: github.event.workflow_run.head_sha`), pas le HEAD courant de `main`.

| Étape            | Description                                               |
| ---------------- | --------------------------------------------------------- |
| Checkout         | Récupération du commit validé par le CI                    |
| Login GHCR       | Authentification sur ghcr.io via `GITHUB_TOKEN`           |
| Build & Push API | Construction et push de l'image backend                   |
| Build & Push Web | Construction et push de l'image frontend                  |
| SSH Deploy       | Connexion SSH au serveur → `docker compose pull && up -d` |
| Créer un tag     | Tag automatique `v1.0.0-YYYYMMDD-sha`                     |

---

## 5. Étapes de déploiement initial (serveur)

Ces étapes sont à réaliser **une seule fois** lors de la mise en place du serveur.

```bash
# 1. Cloner le dépôt sur le serveur
git clone https://github.com/<utilisateur>/CesiZenSolo.git /opt/cesizen
cd /opt/cesizen

# 2. Créer le fichier d'environnement de production
cp .env.prod.example .env.prod
nano .env.prod  # remplir les vraies valeurs

# 3. S'authentifier sur ghcr.io (pour docker compose pull)
echo $GITHUB_TOKEN | docker login ghcr.io -u <utilisateur> --password-stdin

# 4. Premier démarrage
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

## 6. Secrets GitHub Actions requis

À configurer dans **Settings → Secrets and variables → Actions** du dépôt :

| Secret            | Description                                       |
| ----------------- | ------------------------------------------------- |
| `SSH_PRIVATE_KEY` | Clé SSH privée pour se connecter au serveur       |
| `SSH_HOST`        | Adresse IP ou DNS du serveur de production        |
| `SSH_USER`        | Utilisateur SSH sur le serveur (ex. `ubuntu`)     |
| `DOMAIN`          | Domaine de production (ex. `cesizen.example.com`) |

> `GITHUB_TOKEN` est fourni automatiquement par GitHub Actions — pas besoin de le configurer.

---

## 7. Convention de branches

```
main        ← Production (déploiement automatique via CD)
  │
develop     ← Intégration (tests CI automatiques)
  │
feature/*   ← Développement de fonctionnalités
fix/*       ← Corrections de bugs
```

**Règles :**

- Aucun commit direct sur `main`
- Les PR vers `main` nécessitent que les tests CI soient verts
- Les releases sont taguées automatiquement par le CD (`v1.0.0-YYYYMMDD-sha`)

---

## 8. Ressources matérielles recommandées

| Ressource | Minimum          | Recommandé       |
| --------- | ---------------- | ---------------- |
| CPU       | 1 vCPU           | 2 vCPU           |
| RAM       | 1 Go             | 2 Go             |
| Disque    | 10 Go SSD        | 20 Go SSD        |
| OS        | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Docker    | 24.x+            | 27.x+            |

> Serveur actuel : Azure VM B1s (1 vCPU, 1 Go RAM) — suffisant pour une démo et des charges légères.

---

## 9. Rollback

En cas de problème après un déploiement :

```bash
# Sur le serveur, revenir à l'image précédente
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --no-recreate

# Ou spécifier un tag précis dans .env.prod
# API_IMAGE=ghcr.io/<user>/cesizen-api:sha-abc1234
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```
