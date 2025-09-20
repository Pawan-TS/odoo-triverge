# Development Dockerfile for Next.js App
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code
COPY . .

# Expose Next.js dev server port
EXPOSE 3000

# Start development server
CMD ["pnpm", "dev"]