# syntax=docker/dockerfile:1.7
# Multi-arch (linux/amd64, linux/arm64) production image for Kali-webOS
# Build: docker buildx build --platform linux/amd64,linux/arm64 -t kali-webos:2.0.0 .

# ─── Stage 1: dependencies ───────────────────────────────────────────────
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --no-audit --no-fund

# ─── Stage 2: build ──────────────────────────────────────────────────────
FROM node:26-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build && \
    npm prune --omit=dev --no-audit --no-fund

# ─── Stage 3: distroless runtime ─────────────────────────────────────────
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runtime
WORKDIR /app

LABEL org.opencontainers.image.title="Kali-webOS"
LABEL org.opencontainers.image.description="Hacker-themed browser OS with AetherClaw CoT multi-agent — 59 apps"
LABEL org.opencontainers.image.version="2.0.0"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/kali-webos/kali-webos"
LABEL org.opencontainers.image.vendor="Kali-webOS"

COPY --from=build --chown=nonroot:nonroot /app/dist ./dist
COPY --from=build --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=build --chown=nonroot:nonroot /app/package.json ./package.json

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

EXPOSE 3000
USER nonroot

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["/nodejs/bin/node", "-e", "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

ENTRYPOINT ["/nodejs/bin/node", "dist/boot.js"]
