# Build stage
FROM node:18-slim AS builder

# Install required packages
RUN apt-get update && apt-get install -y \
    python3-minimal \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    make \
    g++ \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create working directory
WORKDIR /build

# Copy package.json files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev && \
    cd node_modules/@tensorflow/tfjs-node && \
    npm rebuild @tensorflow/tfjs-node --build-from-source

# Copy source code
COPY . .

# Production stage
FROM node:18-slim

# Create non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs -G audio,video nodejs

# Install required runtime packages
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    curl \
    libc6 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create working directory
WORKDIR /app

# Copy files from builder stage
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/src ./src
COPY --from=builder /build/package.json ./

# Create model directories and set permissions
RUN mkdir -p public/models/mobilenetv2 && \
    chown -R nodejs:nodejs /app && \
    chmod -R 755 /app/public/models

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    NODE_OPTIONS="--max-old-space-size=2048" \
    MODEL_RETRY_ATTEMPTS=3

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "--optimize_for_size", "--gc_interval=100", "src/index.js"] 