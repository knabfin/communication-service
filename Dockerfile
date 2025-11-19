# ------------------------------
# 1. Build Stage
# ------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production=false

# Copy source code
COPY . .

# Build NestJS dist folder
RUN npm run build


# ------------------------------
# 2. Runner Stage (lightweight)
# ------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only what is needed
COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

# Expose port (same as your main.ts)
EXPOSE 3000

CMD ["node", "dist/main.js"]
