FROM node:22-bookworm-slim

RUN apt-get update
RUN apt install -y \
  libnss3 \
  libdbus-1-3 \
  libatk1.0-0 \
  libgbm-dev \
  libasound2 \
  libxrandr2 \
  libxkbcommon-dev \
  libxfixes3 \
  libxcomposite1 \
  libxdamage1 \
  libatk-bridge2.0-0 \
  libpango-1.0-0 \
  libcairo2 \
  libcups2

COPY package.json package*.json yarn.lock* pnpm-lock.yaml* bun.lockb* bun.lock* tsconfig.json* remotion.config.* ./
COPY src ./src
COPY prisma ./prisma
COPY public ./public

RUN npm i

RUN npx remotion browser ensure

RUN npm install -g tsx

# Cache bust: force remotion bundle to always run fresh
ARG CACHEBUST=1
RUN echo "Building bundle with compositions: $(date)" && npx remotion bundle

RUN npx prisma generate

CMD ["sh", "-c", "npx prisma migrate deploy && tsx src/render-server.ts"]
