# Plan de sécurisation — CESIZen

## 1. Contexte

CESIZen est une application de santé mentale qui collecte et traite des **données personnelles sensibles** (compte utilisateur, historique des exercices, ressources consultées). La sécurisation de l'application est donc une priorité absolue.

Ce document couvre :
- L'analyse des vulnérabilités OWASP Top 10
- Les mesures préventives mises en place
- La procédure de gestion de crise
- La conformité RGPD

---

## 2. Analyse OWASP Top 10 appliquée à CESIZen

### Matrice de risque

> **Criticité** = Probabilité × Impact  
> Probabilité : Faible (1) / Moyenne (2) / Élevée (3)  
> Impact : Faible (1) / Moyen (2) / Élevé (3)

| # | Vulnérabilité OWASP | Probabilité | Impact | Criticité | Statut |
|---|---|---|---|---|---|
| A01 | Broken Access Control | 2 | 3 | **6 — Élevé** | Atténué |
| A02 | Cryptographic Failures | 1 | 3 | **3 — Moyen** | Atténué |
| A03 | Injection (SQL, NoSQL) | 2 | 3 | **6 — Élevé** | Atténué |
| A04 | Insecure Design | 1 | 2 | **2 — Faible** | Suivi |
| A05 | Security Misconfiguration | 2 | 2 | **4 — Moyen** | Atténué |
| A06 | Vulnerable Components | 2 | 2 | **4 — Moyen** | En cours |
| A07 | Auth Failures | 2 | 3 | **6 — Élevé** | Atténué |
| A08 | Integrity Failures (CSRF) | 1 | 2 | **2 — Faible** | Atténué |
| A09 | Security Logging Failures | 2 | 2 | **4 — Moyen** | Partiel |
| A10 | SSRF | 1 | 1 | **1 — Faible** | Non applicable |

---

### A01 — Broken Access Control (Criticité : Élevé)

**Risque :** Un utilisateur standard accède à des ressources administrateur ou aux données d'un autre utilisateur.

**Mesures en place :**
- Middleware d'authentification JWT sur toutes les routes protégées (`back/src/middlewares/`)
- Vérification du rôle (`USER` / `ADMIN`) côté API à chaque requête
- Les routes `/api/admin/*` sont exclusivement accessibles aux comptes `ADMIN`
- Pas d'identifiants séquentiels exposés dans les URL (utilisation de l'ID interne de Prisma avec vérification de propriété)

**Action restante :** Audit régulier des routes pour s'assurer qu'aucune n'est involontairement non protégée.

---

### A02 — Cryptographic Failures (Criticité : Moyen)

**Risque :** Données sensibles (mots de passe, tokens) stockées ou transmises en clair.

**Mesures en place :**
- Mots de passe hashés avec **bcrypt** (facteur de coût ≥ 10)
- Tokens JWT signés avec des secrets forts (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) stockés en variables d'environnement
- Le hash du refresh token est stocké en base (pas le token brut)
- HTTPS obligatoire en production via **Traefik + Let's Encrypt** (TLS 1.2+)
- Aucune donnée sensible dans les logs

---

### A03 — Injection SQL (Criticité : Élevé)

**Risque :** Un attaquant manipule des requêtes SQL pour extraire ou modifier des données.

**Mesures en place :**
- **Prisma ORM** utilisé exclusivement : toutes les requêtes sont paramétrées, jamais de SQL brut interpolé
- Validation des entrées avec **Zod** avant tout traitement (`back/src/validators/`)
- Aucune concaténation de chaînes pour construire des requêtes

---

### A05 — Security Misconfiguration (Criticité : Moyen)

**Risque :** Configuration par défaut non sécurisée, services exposés inutilement.

**Mesures en place :**
- Traefik comme unique point d'entrée, les conteneurs internes ne sont pas exposés directement
- Port de la base de données (5432) non exposé sur l'interface publique
- En-têtes HTTP de sécurité configurés dans Nginx (`nginx.conf`) :
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy` (politique stricte)
- Fichiers `.env` jamais versionnés ni intégrés dans les images Docker
- Conteneur API exécuté avec un utilisateur **non-root** (`USER node`)
- `HEALTHCHECK` Docker sur l'API (`/health`) et le frontend (`/`), complétés par des healthchecks Traefik au niveau load-balancer : un conteneur en échec n'est plus jamais utilisé pour router le trafic
- `mem_limit` défini sur tous les services (`docker-compose.prod.yml`) pour limiter l'impact d'une fuite mémoire ou d'un conteneur compromis

---

### A06 — Vulnerable and Outdated Components (Criticité : Moyen)

**Risque :** Dépendances npm avec des vulnérabilités connues.

**Mesures en place :**
- `npm audit --omit=dev` exécuté en CI sur `back`, `cesizen-api` et `web` — bloque le build si une vulnérabilité 🔴 Critical ou 🟠 High est détectée (récapitulatif visuel par sévérité dans le résumé GitHub Actions)
- Scan **Trivy** des images Docker (API et Web) en CI — bloque le build si une vulnérabilité OS/dépendance 🔴 Critical ou 🟠 High est détectée
- Images de base Alpine mises à jour (`apk upgrade --no-cache`) à chaque build pour intégrer les correctifs publiés après le tag de l'image officielle
- Dependabot configuré pour ouvrir automatiquement des PR de mise à jour (npm + GitHub Actions)
- Dépendances mises à jour mensuellement

---

### A07 — Authentication Failures (Criticité : Élevé)

**Risque :** Authentification contournable, sessions volables ou persistantes indéfiniment.

**Mesures en place :**
- **Access token** JWT de courte durée (15 minutes) — `JWT_ACCESS_EXPIRES=15m`
- **Refresh token** de longue durée (7 jours) stocké en cookie HttpOnly, jamais accessible via JavaScript
- Rotation du refresh token à chaque renouvellement
- Hash du refresh token en base de données — invalide dès révocation
- Déconnexion effective (suppression du hash en base + cookie effacé)

---

### A08 — CSRF (Criticité : Faible)

**Risque :** Un site malveillant soumet des requêtes à l'API au nom d'un utilisateur connecté.

**Mesures en place :**
- API REST consommée uniquement par le frontend de même origine (CORS strict configuré via `FRONT_ORIGIN`)
- Le refresh token est en cookie HttpOnly + SameSite=Strict
- Toutes les mutations d'état utilisent le verbe HTTP approprié (POST/PUT/DELETE)

---

### A09 — Security Logging (Criticité : Moyen)

**Risque :** Absence de logs empêchant la détection d'attaques et l'investigation post-incident.

**Mesures en place :**
- Logs Express sur chaque requête (méthode, route, code HTTP, durée)
- Logs d'erreur catchés et enregistrés sans exposition de stack trace à l'utilisateur final

**Action restante :** Centraliser les logs dans un service de monitoring (ex. Grafana Loki ou un simple fichier rotatif).

---

## 3. Procédure de gestion de crise

### Escalade en 3 niveaux

```
NIVEAU 1 — Détection (0 à 15 min)
├── Qui : Tout utilisateur, monitoring automatique
├── Action : Ouvrir un GitHub Issue avec label "critical"
├── Notification : Responsable technique contacté
└── Objectif : Qualifier l'incident (P1/P2/P3)

NIVEAU 2 — Confinement (15 min à 1h)
├── Qui : Responsable technique
├── Actions :
│   ├── Analyser les logs de production
│   ├── Isoler le service impacté si nécessaire
│   ├── Effectuer un rollback si le correctif n'est pas immédiat
│   └── Informer les utilisateurs si l'impact est visible
└── Objectif : Rétablir le service ou limiter la fuite

NIVEAU 3 — Résolution et post-mortem (1h à 4h — P1)
├── Qui : Responsable technique
├── Actions :
│   ├── Déployer le correctif via le pipeline CD (branche fix/* → main)
│   ├── Vérifier en production
│   ├── Rédiger le post-mortem dans le GitHub Issue :
│   │   ├── Cause racine
│   │   ├── Impact (utilisateurs affectés, durée)
│   │   ├── Chronologie des actions
│   │   └── Actions préventives pour éviter la récurrence
│   └── Fermer le ticket
└── Objectif : Résolution définitive + prévention
```

### Commandes utiles en situation de crise

```bash
# Vérifier l'état de tous les services
docker compose -f docker-compose.prod.yml ps

# Consulter les logs en temps réel
docker compose -f docker-compose.prod.yml logs -f api

# Redémarrer un service sans downtime
docker compose -f docker-compose.prod.yml restart api

# Rollback complet
docker compose -f docker-compose.prod.yml down
# Modifier API_IMAGE dans .env.prod pour pointer vers le tag précédent
docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d
```

---

## 4. Données personnelles et conformité RGPD

### 4.1 Données collectées

| Donnée | Finalité | Base légale | Durée de conservation |
|---|---|---|---|
| Prénom, Nom | Personnalisation du compte | Contrat | Durée du compte + 1 an |
| Adresse email | Authentification | Contrat | Durée du compte + 1 an |
| Mot de passe (hashé bcrypt) | Authentification | Contrat | Durée du compte + 1 an |
| Historique des exercices | Suivi du bien-être | Intérêt légitime | Durée du compte |
| Ressources consultées | Personnalisation | Intérêt légitime | Durée du compte |
| Date d'inscription | Gestion du compte | Obligation légale | 5 ans |

### 4.2 Droits des utilisateurs (RGPD Art. 15-22)

| Droit | Implémentation dans CESIZen |
|---|---|
| **Droit d'accès** | L'utilisateur peut consulter ses données depuis son profil |
| **Droit de rectification** | Modification du profil disponible dans l'application |
| **Droit à l'effacement** | Fonctionnalité d'anonymisation implémentée (champ `isAnonymized` en base) |
| **Droit à la portabilité** | Export des données à implémenter (prévu) |
| **Droit d'opposition** | Désinscription possible depuis le compte |

### 4.3 Mesures techniques RGPD

- **Pseudonymisation** : le champ `isAnonymized` efface les données personnelles tout en conservant les données agrégées
- **Chiffrement en transit** : HTTPS obligatoire (Traefik + Let's Encrypt)
- **Minimisation** : seules les données nécessaires au service sont collectées
- **Accès restreint** : seuls les administrateurs voient les données utilisateurs, via authentification forte
- **Journalisation** : les accès aux données sensibles sont loggés

### 4.4 Responsable du traitement

- Responsable : Mathieu Monnie
- Contact : mathieu.monnie7@gmail.com
- Hébergement : Microsoft Azure, région Switzerland North (conformité UE)
