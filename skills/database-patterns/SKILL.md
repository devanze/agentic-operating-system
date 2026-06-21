---
name: database-patterns
description: Database patterns for schema design, indexing, query optimization, migrations, transactions, and connection management. Use when designing schemas, writing queries, or reviewing database changes.
---

# Database Patterns

## Schema Design

### Table Conventions
- Plural table names: `users`, `orders`, `products`
- `snake_case` for columns: `created_at`, `user_id`
- Primary key: `id` (UUID or BIGSERIAL)
- Timestamps: `created_at TIMESTAMPTZ DEFAULT NOW()`
- Soft delete: `deleted_at TIMESTAMPTZ` (nullable)

### Data Types
- IDs: `UUID` or `BIGSERIAL`
- Text: `TEXT` (not VARCHAR with arbitrary limit)
- Timestamps: `TIMESTAMPTZ` (never `TIMESTAMP`)
- Money: `DECIMAL` or `BIGINT` (cents), never `FLOAT`
- Booleans: `BOOLEAN NOT NULL DEFAULT false`
- JSON: `JSONB` for flexible data
- Enums: Use lookup tables, not native ENUM

### Constraints
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Indexing

### When to Index
- Foreign key columns
- Columns in WHERE clauses
- Columns in JOIN conditions
- Columns in ORDER BY
- Columns in GROUP BY

### Index Types
```sql
-- B-tree (default) — equality + range queries
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Composite — multi-column queries
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Partial — filtered data
CREATE INDEX idx_active_orders ON orders(created_at) WHERE status = 'active';

-- GIN — full-text search, array containment
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', name));

-- Unique — enforce uniqueness
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

### Avoid
- Indexing every column
- Indexing small tables (<1000 rows)
- Redundant indexes
- Unused indexes (monitor with `pg_stat_user_indexes`)

## Query Optimization

```sql
-- BAD — SELECT *
SELECT * FROM orders WHERE user_id = 123;

-- GOOD — specify columns
SELECT id, status, total, created_at FROM orders WHERE user_id = 123;

-- BAD — N+1 queries
for user in users:
    orders = db.query("SELECT * FROM orders WHERE user_id = ?", user.id)

-- GOOD — JOIN or batch
SELECT u.*, o.* FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.id IN (1, 2, 3);
```

Use `EXPLAIN ANALYZE` to verify query plans.

## Migrations

- Always have `up` and `down` paths
- Never edit existing migrations — create new ones
- Add indexes CONCURRENTLY in production
- Backfill data in batches (<10000 rows at a time)
- Test migrations on a staging database first
- Lock tables only when necessary

## Transactions

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
-- On error: ROLLBACK;
```

- Wrap multi-statement changes in transactions
- Keep transactions short
- Use appropriate isolation levels
- Handle deadlocks with retry logic
