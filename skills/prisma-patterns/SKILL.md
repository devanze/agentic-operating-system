---
name: prisma-patterns
description: Prisma ORM patterns covering schema design, migrations, query optimization, transactions, middleware, and testing. Use when working with Prisma.
---

# Prisma Patterns

## Schema Design
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  comments  Comment[]
  createdAt DateTime @default(now())
}
```

## Query Optimization
```typescript
// Eager loading with include
const user = await prisma.user.findUnique({
  where: { id },
  include: { posts: { include: { comments: true } } }
})

// Select specific fields
const users = await prisma.user.findMany({
  select: { id: true, email: true }
})
```

## Transactions
```typescript
const [user, profile] = await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.profile.create({ data: profileData })
])
```

## Migrations
```bash
npx prisma migrate dev --name add-user-role
npx prisma migrate deploy    # Production
```
