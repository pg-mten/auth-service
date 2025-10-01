# Use Node.js base image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including dev dependencies for build
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client and build project
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application and Prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js || exit 1

CMD ["node", "dist/main.js"]