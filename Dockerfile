FROM node:18-slim

RUN apt-get update && apt-get install -y \
    python3-minimal \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --build-from-source --only=production \
    && npm cache clean --force

COPY . .

RUN mkdir -p public/models/mobilenetv2

EXPOSE 3000

ENV NODE_OPTIONS="--max-old-space-size=2048"

CMD ["node", "--optimize_for_size", "--gc_interval=100", "src/index.js"] 