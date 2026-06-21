---
name: deployment-patterns
description: Deployment patterns covering CI/CD pipelines, Docker, environment management, zero-downtime deploys, rollback strategies, and monitoring. Use when setting up or modifying deployment infrastructure.
---

# Deployment Patterns

## CI/CD Pipeline

```
Push → Build → Test → Lint → Security Scan → Deploy Staging → E2E Tests → Deploy Production
```

### Pipeline Stages
1. **Install** — `npm ci` or `pip install` with locked dependencies
2. **Lint & Format** — Enforce code style consistency
3. **Test** — Unit + Integration tests, 80%+ coverage
4. **Security Scan** — Dependency audit, SAST, secret scanning
5. **Build** — Production-optimized build
6. **Deploy Staging** — Deploy to staging environment
7. **Smoke Tests** — Quick verification on staging
8. **Deploy Production** — Gradual rollout (canary/blue-green)

## Environment Management

```
.env.example     — Template with dummy values (committed)
.env             — Local values (gitignored)
.env.staging     — Staging values (secret manager)
.env.production  — Production values (secret manager)
```

- Never commit `.env` files
- Use different API keys per environment
- Rotate secrets regularly
- Validate required env vars at startup

## Docker

### Multi-stage Build
```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

- Use specific versions, not `latest`
- Use `alpine` for small images
- Run as non-root user
- Multi-stage builds reduce image size
- `.dockerignore` to exclude unnecessary files

### Docker Compose
```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    depends_on: [db]
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:
```

## Zero-Downtime Deploy

### Blue-Green
- Two identical environments (blue active, green idle)
- Deploy to idle environment
- Run health checks
- Switch traffic to new environment
- Keep old environment for quick rollback

### Rolling Update
- Update instances one at a time
- Run health checks after each update
- Rollback on any health check failure
- Requires at least 2 instances

### Canary Release
- Deploy new version to small % of traffic
- Monitor metrics (errors, latency, conversion)
- Gradually increase to 100%
- Immediate rollback if metrics degrade

## Rollback Strategy

- Keep last N deployments ready for rollback
- Database migrations must be reversible
- Automated rollback on health check failure
- Test rollback procedure regularly
- Have a runbook with rollback steps

## Monitoring & Alerting

- **Logging** — Structured JSON logs, centralized (ELK, Datadog)
- **Metrics** — Response time, error rate, throughput, resource usage
- **Tracing** — Distributed tracing for request flows
- **Alerting** — Alert on error rate spikes, high latency, resource exhaustion
- **Health checks** — `/health` endpoint, database connectivity, external service status

## Build Optimization

- Cache dependencies between builds
- Parallel test execution
- Only build changed services in monorepo
- Use build matrices for multi-platform
- Pre-build Docker layers for faster deploys
