---
name: production-audit
description: Production readiness audit patterns covering error handling, logging, monitoring, security, deployment, and disaster recovery. Use before production deployments.
---

# Production Readiness Audit

## Audit Checklist

### Error Handling
- [ ] All try-catch blocks handle errors appropriately
- [ ] No swallowed exceptions
- [ ] User-facing error messages are generic
- [ ] Detailed errors logged internally
- [ ] Graceful degradation where applicable

### Logging & Observability
- [ ] Structured logging (JSON format)
- [ ] Log levels used correctly (ERROR, WARN, INFO, DEBUG)
- [ ] Request IDs for traceability
- [ ] Performance metrics collection
- [ ] Health check endpoint

### Security
- [ ] HTTPS enforced
- [ ] Authentication on all protected routes
- [ ] Input validation on all endpoints
- [ ] No secrets in code, logs, or config
- [ ] CORS configured restrictively
- [ ] Rate limiting enabled

### Performance
- [ ] Database queries optimized (no N+1)
- [ ] Appropriate caching strategy
- [ ] Static assets compressed and cached
- [ ] Connection pooling configured
- [ ] Load tested at expected peak

### Deployment
- [ ] Zero-downtime deployment strategy
- [ ] Database migrations are reversible
- [ ] Rollback plan documented
- [ ] Health checks for deployment verification

### Disaster Recovery
- [ ] Database backups configured and tested
- [ ] Incident response runbook
- [ ] On-call rotation established
- [ ] SLA/SLO defined and monitored
