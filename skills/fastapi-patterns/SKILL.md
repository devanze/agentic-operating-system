---
name: fastapi-patterns
description: FastAPI patterns covering Pydantic models, dependency injection, middleware, background tasks, WebSockets, and testing. Use when building FastAPI applications.
---

# FastAPI Patterns

## Pydantic Models
```python
from pydantic import BaseModel, Field, EmailStr

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=1, max_length=100)

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime
```

## Dependency Injection
```python
async def get_db():
    async with SessionLocal() as session:
        yield session

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    ...
    return user

@router.get("/me")
async def read_me(user: User = Depends(get_current_user)):
    return user
```

## Error Handling
```python
@router.get("/users/{id}")
async def get_user(id: int, db = Depends(get_db)):
    user = await db.get(User, id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

## Background Tasks
```python
@router.post("/register")
async def register(
    data: CreateUserRequest,
    background_tasks: BackgroundTasks,
    db = Depends(get_db)
):
    user = await create_user(db, data)
    background_tasks.add_task(send_welcome_email, user.email)
    return user
```
