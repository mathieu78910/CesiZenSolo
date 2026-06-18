# CesiZen

[![CI](https://github.com/mathieu78910/CesiZenSolo/actions/workflows/ci.yml/badge.svg)](https://github.com/mathieu78910/CesiZenSolo/actions/workflows/ci.yml)
[![CD](https://github.com/mathieu78910/CesiZenSolo/actions/workflows/cd.yml/badge.svg)](https://github.com/mathieu78910/CesiZenSolo/actions/workflows/cd.yml)

Application de bien-être mental destinée aux étudiants CESI.  
Permet de pratiquer des exercices de respiration et de consulter des articles de fond sur la gestion du stress.

**Production →** https://cesizen-mathieu-monnie.switzerlandnorth.cloudapp.azure.com

---

## Architecture

```
CesiZenSolo/
├── back/          — API REST (Node.js · Express · Prisma · PostgreSQL)
├── web/           — Frontend (React 18 · Vite · React Router v7)
├── cesizen-api/   — Client API partagé (ESM, consommé par web/)
├── e2e/           — Tests end-to-end (Selenium WebDriver · node:test)
└── docs/          — Documentation technique (déploiement, sécurité, maintenance…)
```

| Couche | Technologie |
|---|---|
| Frontend | React 18, Vite, React Router v7 |
| Backend | Node.js 22, Express 5, TypeScript |
| ORM | Prisma 7 (driver adapter pg) |
| Base de données | PostgreSQL 16 |
| Reverse proxy | Traefik v3 (HTTPS Let's Encrypt automatique) |
| Conteneurisation | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Registry images | GitHub Container Registry (ghcr.io) |

---

## Démarrage local

### Prérequis

- Node.js 22+
- Docker Desktop

### 1. Base de données

```bash
docker compose up -d   # démarre PostgreSQL sur le port 5433
```

### 2. Backend

```bash
cd back
npm install
npm run prisma:generate
npm run prisma:migrate   # applique les migrations en local
npm run dev              # écoute sur http://localhost:3000
```

### 3. Frontend

```bash
cd web
npm install
npm run dev              # écoute sur http://localhost:5173
```

Le client API partagé (`cesizen-api`) est référencé comme dépendance locale dans `web/package.json` et se résout automatiquement.

---

## Tests

### Tests unitaires (Vitest)

```bash
cd back
npm test
```

### Tests end-to-end (Selenium)

Lance la stack complète (db, API, web, Chrome headless) puis exécute les tests :

```bash
docker compose -f docker-compose.e2e.yml up -d --build db api web selenium
docker compose -f docker-compose.e2e.yml run --rm api npx tsx src/scripts/seed-e2e.ts
docker compose -f docker-compose.e2e.yml run --rm e2e
docker compose -f docker-compose.e2e.yml down -v
```

Parcours couverts : accès `/login`, inscription d'un utilisateur, connexion admin → console.

---

## Pipeline CI/CD

### CI — `.github/workflows/ci.yml`

Déclenché sur chaque push/PR vers `main` ou `develop`.

| Job | Contenu |
|---|---|
| `test-api` | TypeCheck TypeScript + Vitest + `npm audit` (bloque si HIGH/CRITICAL) |
| `build-web` | Build Vite + `npm audit` cesizen-api et web |
| `docker-audit` | Scan Trivy des images Docker — bloque si HIGH/CRITICAL |
| `e2e-tests` | Suite Selenium complète sur stack Docker isolée |

### CD — `.github/workflows/cd.yml`

Déclenché automatiquement après un CI réussi sur `main`.

1. Build & push des images sur ghcr.io
2. Déploiement SSH sur le serveur Azure (`docker compose pull && up -d`)
3. Création d'une GitHub Release avec notes auto-générées

---

## Déploiement production

Le serveur tourne sur une VM Azure (Switzerland North).  
Voir [`docs/plan-deploiement.md`](docs/plan-deploiement.md) pour les étapes complètes.

Variables d'environnement requises dans `.env.prod` sur le serveur :

```env
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
DOMAIN=
ACME_EMAIL=
API_IMAGE=ghcr.io/mathieu78910/cesizen-api:latest
WEB_IMAGE=ghcr.io/mathieu78910/cesizen-web:latest
```

Secrets GitHub Actions requis : `SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_USER`, `DOMAIN`.

---

## Documentation

| Document | Contenu |
|---|---|
| [`docs/plan-deploiement.md`](docs/plan-deploiement.md) | Architecture, pipeline CI/CD, étapes de déploiement, rollback |
| [`docs/plan-securisation.md`](docs/plan-securisation.md) | Analyse OWASP, actions correctives, gestion de crise, RGPD |
| [`docs/plan-maintenance.md`](docs/plan-maintenance.md) | Ticketing GitHub Issues, SLA, gestion des évolutions |
| [`docs/veille-technologique.md`](docs/veille-technologique.md) | Dependabot, processus de veille |
| [`docs/bonnes-pratiques.md`](docs/bonnes-pratiques.md) | Conventions de code, tests, sécurité |

---

## Monitoring

Grafana est accessible en production à `https://<domaine>/grafana` (login `admin`).

Dashboard pré-configuré :
- Compteurs : erreurs 500, connexions réussies, tentatives suspectes
- Logs filtrés API + logs Traefik en temps réel
- Alertes email sur erreurs 500 et brute force (SMTP requis dans `.env.prod`)

Variables `.env.prod` à ajouter pour activer les alertes email :
```env
GRAFANA_ADMIN_PASSWORD=<mot-de-passe-fort>
GF_SMTP_ENABLED=true
GF_SMTP_HOST=smtp.gmail.com:587
GF_SMTP_USER=<email>
GF_SMTP_PASSWORD=<app-password>
GF_SMTP_FROM_ADDRESS=<email>
GF_ALERT_EMAIL=<destinataire>
```

---

## Suivi des évolutions

[Tableau Kanban → GitHub Projects](https://github.com/users/mathieu78910/projects/2)  
[Releases → GitHub Releases](https://github.com/mathieu78910/CesiZenSolo/releases)
