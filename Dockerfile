# Stage 1: Build the application with full build tools
FROM node:20 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Force compilation from source to match the exact glibc version of the container
RUN npm install --build-from-source

COPY . .

RUN npm run build

# Prune development dependencies
RUN npm prune --production

# Stage 2: Production runtime environment
FROM node:20-slim

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy precompiled production dependencies (compiled from source) and app build
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Create a directory for persistent SQLite storage
RUN mkdir -p /usr/src/app/data

EXPOSE 3000

CMD ["node", "dist/main"]
