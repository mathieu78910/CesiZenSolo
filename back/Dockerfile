FROM node:26-alpine
WORKDIR /app

# Applique les correctifs de sécurité Alpine (ex: OpenSSL) non encore
# présents dans l'image de base au moment de sa publication.
RUN apk upgrade --no-cache

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY types ./types

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh && chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["./entrypoint.sh"]
