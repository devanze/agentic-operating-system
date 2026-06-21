---
name: docker-patterns
description: Docker patterns covering Dockerfile best practices, docker-compose, multi-stage builds, image optimization, security, and development workflows. Use when containerizing applications.
---

# Docker Patterns

## Dockerfile Best Practices

```dockerfile
# Pin base image version
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first (cache layer)
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Copy source after deps (cache bust)
COPY . .

RUN npm run build

# Production stage
FROM node:22-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 app && adduser -u 1001 -G app -s /bin/sh -D app

# Copy only what's needed
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER app
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

## Layer Caching

Order matters — put frequently-changing layers last:
1. Base image (rarely changes)
2. Package manager files → install (changes with deps)
3. Source code (changes most often)

```dockerfile
COPY package.json package-lock.json ./   # Layer 1: cached
RUN npm ci                                # Layer 2: cached
COPY . .                                  # Layer 3: invalidates on code change
RUN npm run build                         # Layer 4: rebuilds only code
```

## Multi-Stage Builds

```dockerfile
# Stage 1: Build
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server .

# Stage 2: Runtime
FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/server /usr/local/bin/server
USER nobody
ENTRYPOINT ["server"]
```

## Image Optimization

- Use `alpine` variants for small base images
- Combine RUN commands to reduce layers:
  ```dockerfile
  RUN apk add --no-cache curl && \
      curl -o /tmp/file.tar.gz https://... && \
      tar -xzf /tmp/file.tar.gz -C /usr/local && \
      rm /tmp/file.tar.gz
  ```
- Remove build dependencies in final stage
- `.dockerignore` to exclude node_modules, .git, tests, docs
- Use `.dockerignore`:
  ```
  node_modules
  .git
  .env
  tests
  docs
  *.md
  ```

## Docker Compose

```yaml
version: "3.8"
services:
  app:
    build:
      context: .
      target: development
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: app_dev
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

## Security

- Never run as root — use `USER`
- Use specific image tags, not `latest`
- Scan images with `docker scan` or Trivy
- Don't copy secrets into images
- Use `--read-only` flag where possible
- Limit container capabilities:
  ```yaml
  security_opt:
    - no-new-privileges:true
  ```
