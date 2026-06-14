# Veille technologique — CESIZen

## 1. Objectif

La pérennité de CESIZen dépend de la capacité à anticiper :
- les **failles de sécurité** découvertes dans les dépendances utilisées
- les **fins de support** des technologies du socle technique (Node.js, PostgreSQL, React, Docker)
- les **évolutions de l'écosystème** pouvant améliorer la qualité ou la performance de l'application

Ce document décrit la méthodologie de veille mise en place : sources suivies, fréquence, et traduction concrète en actions sur le projet.

---

## 2. Axes de veille

| Axe | Sources suivies | Fréquence |
|---|---|---|
| **Sécurité des dépendances** | GitHub Dependabot Alerts, `npm audit`, GitHub Security Advisories | Automatique (continu) + revue hebdomadaire |
| **Runtime & frameworks** | Node.js Release Schedule, React Blog, Express changelog, Prisma changelog | Mensuelle |
| **Base de données** | PostgreSQL Release Notes | Trimestrielle |
| **Infrastructure** | Docker Security Advisories, Traefik changelog, Let's Encrypt | Trimestrielle |
| **Bonnes pratiques sécurité** | OWASP Top 10, CNIL (RGPD) | Semestrielle |

---

## 3. Outils de veille automatisée mis en place

### 3.1 Dependabot (GitHub)

Configuré dans [`.github/dependabot.yml`](../.github/dependabot.yml). Dependabot scanne automatiquement :
- `back/package.json` (dépendances npm du backend)
- `web/package.json` (dépendances npm du frontend)
- `cesizen-api/package.json`
- Les `Dockerfile` (images de base)
- Les workflows GitHub Actions

**Fonctionnement concret :**
1. Dependabot détecte une nouvelle version disponible ou une vulnérabilité connue (CVE)
2. Il ouvre automatiquement une **Pull Request** avec le changement de version
3. Le pipeline **CI** (`ci.yml`) s'exécute automatiquement sur cette PR
4. Si les tests passent, la PR peut être mergée en confiance

### 3.2 GitHub Security Alerts

Activées sur le dépôt (`Settings → Security → Dependabot alerts`). Toute vulnérabilité critique génère une alerte visible dans l'onglet **Security** du dépôt.

### 3.3 npm audit

Exécutable manuellement avant chaque release :
```bash
cd back && npm audit --audit-level=high
cd web && npm audit --audit-level=high
```

---

## 4. Processus de traitement d'une alerte de veille

```
Alerte détectée (Dependabot / npm audit / annonce officielle)
        │
        ▼
Évaluation de l'impact
  ├── Vulnérabilité critique (CVE haute sévérité) → traitement immédiat (< 48h)
  ├── Mise à jour mineure/patch                   → intégrée au prochain cycle (sprint)
  └── Mise à jour majeure (breaking change)       → ticket "enhancement" pour planification
        │
        ▼
Création/validation de la PR Dependabot
        │
        ▼
Vérification CI (tests + typecheck + build)
        │
        ▼
Merge sur develop → validation → merge sur main → déploiement automatique (CD)
```

---

## 5. Exemple de veille appliquée au projet

| Constat de veille | Action engagée |
|---|---|
| Node.js 22 est la version LTS active | Socle technique déjà aligné (`back/Dockerfile` utilise `node:22-alpine`) |
| Prisma publie des versions majeures fréquentes | Dependabot configuré avec `versioning-strategy: increase` mais review manuelle pour les majeures |
| Traefik v3 recommandé pour la gestion TLS automatique | Déjà en place (`docker-compose.prod.yml`) |
| OWASP recommande la rotation des secrets JWT | Documenté dans `docs/plan-securisation.md`, secrets stockés en variables d'environnement facilement rotables |
