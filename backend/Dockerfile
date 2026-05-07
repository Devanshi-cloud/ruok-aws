# Multi-stage build: compile TypeScript, then run with production-only npm dependencies.
# Requires: package-lock.json present next to this Dockerfile.

FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY audios ./audios

RUN npm run build

# --- runtime ---

FROM node:20-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/audios ./audios

USER node

EXPOSE 8000

CMD ["node", "dist/index.js"]

