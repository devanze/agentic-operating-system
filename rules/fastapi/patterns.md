# FastAPI Patterns

## Core Patterns

### Repository Pattern with SQLAlchemy async
```python
class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> User:
        user = User(**data)
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user
```

### Service Layer Pattern
```python
class UserService:
    def __init__(self, repo: UserRepository, email_service: EmailService):
        self.repo = repo
        self.email_service = email_service

    async def register(self, data: CreateUserRequest) -> User:
        existing = await self.repo.get_by_email(data.email)
        if existing:
            raise HTTPException(409, 'Email already registered')
        hashed = hash_password(data.password)
        user = await self.repo.create({'email': data.email, 'password_hash': hashed})
        await self.email_service.send_welcome(user.email)
        return user
```

### Dependency Injection for Services
```python
async def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    repo = UserRepository(db)
    email = EmailService()
    return UserService(repo, email)

@router.post('/register')
async def register(
    data: CreateUserRequest,
    service: Annotated[UserService, Depends(get_user_service)],
):
    user = await service.register(data)
    return UserResponse.model_validate(user)
```

## Architecture
- `app/`: main application package
  - `api/v1/`: route modules (users, auth, orders)
  - `core/`: config, security, database setup
  - `models/`: SQLAlchemy ORM models
  - `schemas/`: Pydantic request/response models
  - `services/`: business logic
  - `repositories/`: data access

## Common Idioms
- `BackgroundTasks` for fire-and-forget operations (emails, logs)
- `@app.on_event('startup')` and `@app.on_event('shutdown')` for lifecycle
- `APIRouter(prefix='/users', tags=['users'])` for route grouping
- `@cache(expire=300)` from `fastapi-cache` for endpoint caching

## Anti-Patterns
- Mixing ORM model and Pydantic schema logic — always separate
- Global state in services — use dependency injection
- Sync database drivers in async handlers — use asyncpg or aiosqlite
- Returning ORM objects directly — always convert to response schemas
