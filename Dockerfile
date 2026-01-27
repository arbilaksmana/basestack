FROM node:18-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3 and others
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
COPY db/ ./db/

# Create data directory
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/database.sqlite

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
