---
name: redis-patterns
description: Redis patterns covering caching, sessions, rate limiting, pub/sub, queues, sorted sets, and distributed locks. Use when integrating Redis.
---

# Redis Patterns

## Caching
```
SET key value EX 3600      # Set with expiry
GET key
DEL key                    # Invalidate

# Cache aside pattern
1. Check cache
2. If miss, fetch from DB
3. Store in cache with TTL
4. Invalidate on update
```

## Session Store
```
SET session:{id} "{json}" EX 86400
GET session:{id}
DEL session:{id}
```

## Rate Limiting
```
# Sliding window
MULTI
ZREMRANGEBYSCORE rate:{key} 0 {now - window}
ZCARD rate:{key}
ZADD rate:{key} {now} {now}
EXPIRE rate:{key} {window}
EXEC
```

## Pub/Sub
```python
# Publisher
r.publish('channel:notifications', json.dumps(msg))

# Subscriber
pubsub = r.pubsub()
pubsub.subscribe('channel:notifications')
for msg in pubsub.listen():
    process(msg)
```

## Distributed Locks
```
# Redlock algorithm
SET lock:{resource} {token} NX PX 30000
# ... do work ...
if GET lock:{resource} == token:
    DEL lock:{resource}
```
