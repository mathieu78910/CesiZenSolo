FROM node:26-alpine AS builder
WORKDIR /app

# Copy shared API client (local file: dependency) and build it.
# Note: cesizen-api/dist is excluded from the build context by .dockerignore
# (**/dist/), so it must be regenerated here from src/.
COPY cesizen-api/ ./cesizen-api/
RUN npm run build --prefix cesizen-api

# Install web dependencies
COPY web/package.json web/package-lock.json ./web/
WORKDIR /app/web
RUN npm ci

# Copy source files
COPY web/src ./src
COPY web/index.html ./
COPY web/vite.config.js ./

# VITE_API_URL is embedded at build time by Vite
ARG VITE_API_URL=https://cesizen.mathieu-monnie.switzerlandnorth.cloudapp.azure.com
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/web/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
