# Build stage
FROM node:22-alpine AS builder

# Install dependencies for better-sqlite3 compilation
RUN apk add --no-cache python3 make g++ 

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS production

# Install dependencies for better-sqlite3 runtime and wget for healthcheck
RUN apk add --no-cache python3 make g++ wget

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Rebuild better-sqlite3 for alpine
RUN npm rebuild better-sqlite3

# Copy built application from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/docker-entrypoint.sh ./

# Make entrypoint executable
RUN chmod +x /app/docker-entrypoint.sh

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV ORIGIN=http://localhost:3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application via entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]
