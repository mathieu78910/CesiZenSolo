# CesiZen

Monorepo minimal avec:
- Frontend: React + Vite
- Backend: Express + Prisma
- Base de données: PostgreSQL via Docker

## Démarrage rapide

1) Lancer PostgreSQL
```
docker compose up -d
```

2) Backend
```
cd back
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

3) Frontend
```
cd ../front
npm install
npm run dev
```

## Endpoints
- GET /health
