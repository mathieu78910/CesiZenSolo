# Guide d'installation et d'exploitation

## 1. Prerequis

- Node.js 20 ou superieur recommande
- npm
- Docker et Docker Compose

## 2. Structure du projet

- `back/` : backend API
- `web/` : frontend admin
- `mobile/` : frontend mobile Expo
- `cesizen-api/` : client API partage

## 3. Base de donnees

Depuis la racine du projet :

```bash
docker compose up -d
```

Base PostgreSQL exposee sur :

- host : `localhost`
- port : `5433`
- database : `cesizen`
- user : `postgres`
- password : `postgres`

## 4. Variables d'environnement backend

Creer un fichier `back/.env` avec par exemple :

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/cesizen
JWT_ACCESS_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
FRONT_ORIGIN=http://localhost:5173,http://localhost:8081
NODE_ENV=development
```

## 5. Installation du backend

```bash
cd back
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

API disponible par defaut sur `http://localhost:3000`.

## 6. Installation du web admin

```bash
cd web
npm install
npm run dev
```

Interface disponible par defaut sur `http://localhost:5173`.

## 7. Installation du mobile

```bash
cd mobile
npm install
npm run start
```

Variables utiles :

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

Notes :

- iOS simulateur : `http://localhost:3000`
- Android emulateur : `http://10.0.2.2:3000`

## 8. Verification rapide

### Backend

Verifier :

```bash
curl http://localhost:3000/health
```

Reponse attendue :

```json
{"status":"ok"}
```

### Typecheck / build

Backend :

```bash
cd back
npm run typecheck
```

Web :

```bash
cd web
npm run build
```

Mobile :

```bash
cd mobile
npx tsc --noEmit
```

## 9. Comptes de test

Le premier compte cree via inscription devient actuellement un compte `USER`.
Pour tester l'administration, il faut :

- creer un utilisateur admin en base
- ou utiliser le CRUD admin apres avoir prepare un compte `ADMIN`

## 10. Points d'attention

- le README racine historique mentionne `front/`, mais le dossier reel est `web/`
- le reset password n'est pas encore implemente de bout en bout
- les tests automatises sont actuellement concentres sur le backend
