---
name: kubernetes-patterns
description: Kubernetes patterns covering deployments, services, configmaps, secrets, health checks, autoscaling, and RBAC. Use when working with Kubernetes.
---

# Kubernetes Patterns

## Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    spec:
      containers:
      - name: app
        image: myapp:1.0.0
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

## Health Checks
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 15

readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  periodSeconds: 5
```

## ConfigMap & Secrets
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
data:
  DATABASE_URL: base64encodedvalue
```

## Service Types
- **ClusterIP** — internal only (default)
- **NodePort** — external via node IP
- **LoadBalancer** — cloud load balancer
- **Ingress** — HTTP routing, TLS termination
