FROM node:22-alpine

WORKDIR /app

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm build

# Copy application code

# Expose port
EXPOSE 3000

# Run in development mode
CMD ["pnpm", "run", "dev"]
