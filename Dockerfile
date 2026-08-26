# ---- build stage -------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Drop dev dependencies so we copy a lean node_modules into the runtime image.
RUN npm prune --omit=dev

# ---- runtime stage -----------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package.json ./package.json

USER node

# A container host injects PORT at runtime; this is only the local default.
ENV PORT=3001
EXPOSE 3001

CMD ["node", "dist/main.js"]
