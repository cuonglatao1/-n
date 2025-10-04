# Multi-stage build for Next.js
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Create workspace structure and copy package files
RUN mkdir -p apps/web packages/shared
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# Install all dependencies for builder
FROM base AS builder-deps
WORKDIR /app
COPY package*.json ./
RUN mkdir -p apps/web packages/shared
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci && \
    npm cache clean --force

# Build frontend
FROM base AS builder
WORKDIR /app

# Copy all dependencies for build
COPY --from=builder-deps /app/node_modules ./node_modules
COPY --from=builder-deps /app/package*.json ./

# Copy shared package source
COPY packages/shared ./packages/shared

# Copy web app source
COPY apps/web ./apps/web

# Build Next.js app
WORKDIR /app/apps/web

# Set build-time environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=https://canvas.lllab.space/api
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Create public directory if it doesn't exist
RUN mkdir -p public

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output (includes minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Copy public folder if it exists (for static assets like images, favicon, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "apps/web/server.js"]

