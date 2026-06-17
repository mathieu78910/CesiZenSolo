# Plan de maintenance — CESIZen

## 1. Objectifs

Ce plan de maintenance définit les processus pour :
- Assurer la disponibilité et la stabilité de l'application CESIZen
- Gérer les incidents de manière structurée et traçable
- Planifier les mises à jour et améliorations

---

## 2. Outil de ticketing — GitHub Issues

Toute demande, bug ou amélioration est tracée via **GitHub Issues** sur le dépôt du projet.

### 2.1 Labels configurés

| Label | Couleur | Usage |
|---|---|---|
| `bug` | Rouge `#d73a4a` | Dysfonctionnement constaté |
| `critical` | Noir `#000000` | Incident bloquant en production (P1) |
| `enhancement` | Bleu `#a2eeef` | Nouvelle fonctionnalité ou amélioration |
| `question` | Rose `#d876e3` | Demande d'information ou de clarification |
| `documentation` | Beige `#d9e0e8` | Mise à jour de la documentation |
| `dependencies` | Bleu clair `#0366d6` | Mise à jour de dépendance (générée par Dependabot, cf. [veille technologique](veille-technologique.md)) |
| `backend` / `frontend` / `docker` / `ci` | Violet `#5319e7` | Périmètre technique concerné |
| `in-progress` | Jaune `#fbca04` | En cours de traitement |
| `wontfix` | Blanc `#ffffff` | Hors périmètre ou décision de ne pas corriger |

### 2.2 Templates disponibles

- **Bug report** : `.github/ISSUE_TEMPLATE/bug_report.md`
- **Feature request** : `.github/ISSUE_TEMPLATE/feature_request.md`

### 2.3 Tableau de bord — GitHub Projects

Un tableau **Kanban** (GitHub Projects) centralise tous les tickets, qu'ils viennent du client (bugs/évolutions) ou de la veille automatisée (Dependabot).

```
┌──────────┐   ┌─────────────────┐   ┌──────────┐
│  Todo    │ → │  In Progress     │ → │  Done    │
│ (triage, │   │  (en cours de    │   │ (livré,  │
│ backlog) │   │  développement)  │   │  fermé)  │
└──────────┘   └─────────────────┘   └──────────┘
```

- **Issues** : https://github.com/mathieu78910/CesiZenSolo/issues
- **Project** : https://github.com/users/mathieu78910/projects/2

---

## 3. Niveaux de criticité et SLA

### 3.1 Classification des incidents

| Niveau | Définition | Exemples | Délai de prise en charge | Délai de résolution |
|---|---|---|---|---|
| **Critique** (P1) | Application inaccessible ou fuite de données | Site down, données exposées, authentification cassée | 1 heure | 4 heures |
| **Majeur** (P2) | Fonctionnalité principale dégradée, pas de contournement | Impossible de créer un compte, exercices de respiration indisponibles | 4 heures | 24 heures |
| **Mineur** (P3) | Bug cosmétique ou fonctionnalité secondaire dégradée | Affichage incorrect, libellé mal orthographié | 1 jour ouvré | 1 semaine |

### 3.2 Processus de traitement

```
Détection de l'incident
        │
        ▼
Création d'un GitHub Issue
  (template bug_report, label approprié)
        │
        ▼
Triage (P1 / P2 / P3)
        │
      ┌─┴──────────────────────────┐
     P1/P2                        P3
      │                            │
      ▼                            ▼
Investigation immédiate       Ajout au backlog
  + communication              sprint suivant
      │
      ▼
Déploiement du correctif
  (branche fix/* → PR → CI → merge main → CD auto)
      │
      ▼
Vérification en production
      │
      ▼
Clôture du ticket + post-mortem si P1
```

---

## 4. Procédure de gestion des incidents

### Niveau 1 — Détection et signalement

Tout utilisateur ou développeur peut signaler un incident via :
- Un **GitHub Issue** avec le label `bug` ou `critical`
- Un message direct au responsable technique

**Actions immédiates :**
1. Créer le ticket GitHub avec le template approprié
2. Attribuer le bon label de criticité
3. Notifier le responsable si P1

### Niveau 2 — Diagnostic et confinement

1. Consulter les logs des conteneurs :
   ```bash
   docker compose -f docker-compose.prod.yml logs api --tail=100
   docker compose -f docker-compose.prod.yml logs web --tail=50
   ```
2. Vérifier l'état des services :
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```
3. Si nécessaire, redémarrer un service sans interruption totale :
   ```bash
   docker compose -f docker-compose.prod.yml restart api
   ```

### Niveau 3 — Escalade

Si le problème ne peut être résolu en moins d'une heure (P1) :
1. Effectuer un **rollback** vers la version précédente (voir plan de déploiement)
2. Documenter la cause racine dans le GitHub Issue
3. Rédiger un post-mortem (cause, impact, corrections apportées, actions préventives)

---

## 5. Gestion des évolutions — méthodologie prestataire / client

Contrairement aux **corrections** (bugs, traités en urgence selon les SLA de la section 3), les **évolutions** (nouvelles fonctionnalités) suivent un cycle de validation avec le client.

### 5.1 Cycle de vie d'une demande d'évolution

```
1. EXPRESSION DU BESOIN (Client)
   └── Le client (ou un utilisateur) crée un GitHub Issue
       avec le template "feature_request", label `enhancement`
              │
              ▼
2. QUALIFICATION (Prestataire)
   └── Le prestataire évalue : faisabilité, charge estimée, impact
       → Discussion dans les commentaires de l'Issue
              │
              ▼
3. PRIORISATION (Client + Prestataire)
   └── L'Issue est placée dans le GitHub Project, colonne "Todo"
       (validée et priorisée pour le prochain cycle)
              │
              ▼
4. DÉVELOPPEMENT (Prestataire)
   └── Création d'une branche feature/<nom-issue>
       → Référencer l'Issue dans les commits : "feat: ... (#12)"
       → L'Issue passe en "In Progress", label `in-progress`
              │
              ▼
5. VALIDATION (Prestataire + Client)
   └── Pull Request vers develop → CI exécuté automatiquement
       → Revue de code + recette fonctionnelle par le client
              │
              ▼
6. LIVRAISON (Automatique)
   └── Merge sur main → déploiement CD automatique
       → L'Issue passe en "Done" et est fermée
       → Le client est notifié via la fermeture de l'Issue (commentaire de clôture)
```

### 5.2 Traçabilité

Chaque évolution livrée est traçable de bout en bout :
- **Issue GitHub** (besoin exprimé) ↔ **Pull Request** (code) ↔ **Commit** (référence `#numéro`) ↔ **Tag de release** (déploiement, cf. `plan-deploiement.md`)

Cela permet de répondre à tout moment à la question : *"Dans quelle version cette demande a-t-elle été livrée ?"*

---

## 6. Maintenance planifiée

| Fréquence | Action |
|---|---|
| **Hebdomadaire** | Vérification des logs d'erreur, état des conteneurs |
| **Hebdomadaire** | Revue des PR Dependabot ouvertes (cf. [veille technologique](veille-technologique.md)) |
| **Mensuelle** | Vérification du renouvellement des certificats Let's Encrypt |
| **Trimestrielle** | Mise à jour des images Docker de base (Node, Nginx, Postgres) |
| **Avant chaque release** | Exécution complète des tests CI (unitaires Vitest + e2e Selenium + audit npm/Trivy), revue des PR ouvertes |

---

## 7. Sauvegardes

| Élément | Fréquence | Méthode |
|---|---|---|
| Base de données PostgreSQL | Quotidienne | `pg_dump` automatisé via cron |
| Fichiers `.env.prod` | À chaque modification | Stockage sécurisé hors dépôt Git |

**Commande de sauvegarde manuelle :**
```bash
docker exec cesizen-db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%Y%m%d).sql
```

---

## 8. Contacts et responsabilités

| Rôle | Responsabilité |
|---|---|
| Développeur principal | Corrections de bugs, déploiements, architecture |
| Utilisateurs | Signalement des incidents via GitHub Issues |
