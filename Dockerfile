# ============================================
# STAGE 1: Dependencies Installation
# ============================================
# Using a separate stage for dependencies allows better caching
# When code changes but dependencies don't, this layer is reused
FROM node:22-alpine AS deps

# Set working directory
WORKDIR /app

# Copy only package files first for better layer caching
COPY package.json package-lock.json ./

# Install production dependencies only
# Using ci for deterministic builds from lockfile
# --omit=dev excludes devDependencies (nodemon, prettier)
RUN npm ci --omit=dev

# ============================================
# STAGE 2: Production Image
# ============================================
FROM node:22-alpine AS production

# Security: Run as non-root user
# Create a dedicated user and group for the app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Set working directory
WORKDIR /app

# Set NODE_ENV for production optimizations
ENV NODE_ENV=production

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY --chown=expressjs:nodejs src ./src
COPY --chown=expressjs:nodejs package.json ./

# Create uploads directory with proper permissions
# This is needed for multer file uploads
RUN mkdir -p /app/public/uploads && \
    chown -R expressjs:nodejs /app/public

# Security: Switch to non-root user
USER expressjs

# Expose the application port
# Default is 5000, but can be overridden via PORT env var
EXPOSE 5000

# Health check to ensure container is running properly
# Checks if the server responds on the /api endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-5000}/api || exit 1

# Start the application
# Using node directly (not npm) for proper signal handling (SIGTERM, SIGINT)
# This ensures graceful shutdown in containerized environments
CMD ["node", "src/server.js"]
