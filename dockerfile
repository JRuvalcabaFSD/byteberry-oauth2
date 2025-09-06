# --- Base
FROM node:lts-slim AS base
WORKDIR /usr/src/app
ENV CI=true
RUN corepack enable

# --- deps de PRODUCCIÓN (para el runner final)
FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

# --- deps completas (DEV + PROD) para compilar
FROM base AS deps_all
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# --- build (usa deps_all con devDeps)
FROM deps_all AS builder
COPY tsconfig*.json ./
COPY src ./src
# Opcional: si tus scripts usan rimraf/tsc/tsc-alias, ejecuta con npx para evitar PATH issues
RUN npx rimraf dist || rm -rf dist
RUN npx tsc -p tsconfig.build.json
RUN npx tsc-alias -p tsconfig.build.json

# --- runner (solo prod)
FROM base AS runner
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nodeuser
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package.json ./
COPY --from=builder /usr/src/app/dist ./dist
USER 1001
ENV NODE_ENV=production PORT=4000
EXPOSE 4000
CMD ["node","dist/app.js"]
