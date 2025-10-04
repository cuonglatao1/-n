# Multi-stage build for NestJS API (Simplified without Turbo)
FROM node:18-alpine AS base

# Install OpenSSL and required libraries for Prisma
RUN apk update && apk upgrade
RUN apk add --no-cache openssl libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Create workspace structure and copy package files
RUN mkdir -p apps/api packages/shared
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --production=false

# Build API
FROM base AS builder
WORKDIR /app/apps/api

# Copy dependencies from deps stage (to parent directory)
COPY --from=deps /app/node_modules ../../node_modules

# Copy shared package source
COPY packages/shared ../../packages/shared

# Copy API source and configs
COPY apps/api/package*.json ./
COPY apps/api/tsconfig*.json ./
COPY apps/api/nest-cli.json ./
COPY apps/api/src ./src
COPY apps/api/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npx nest build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install wget for health checks
RUN apk add --no-cache wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy necessary files
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared ./packages/shared
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./prisma

USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/src/main.js"]

