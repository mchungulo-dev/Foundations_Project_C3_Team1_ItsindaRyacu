# Build context = REPO ROOT (needs ../scripts for the DB bootstrap).
# In Dokploy: Build Type = Dockerfile, Docker File = backend/Dockerfile, Docker Context Path = .
#
# Layout inside the image:
#   /app/backend    -> Express app (server.js)
#   /app/scripts    -> create_database.py
#   /app/database   -> SQLite file (mount a persistent volume here)
FROM node:20-bookworm-slim

# python3: runs scripts/create_database.py on first start
# build tools: fallback if a native module (bcrypt / better-sqlite3) has no prebuilt binary
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./
COPY scripts/ /app/scripts/
COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /app/database

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
