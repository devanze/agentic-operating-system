# FastAPI Coding Style

## Naming
- Routes: `snake_case` paths (e.g., `/api/v1/user-profiles/`)
- Pydantic models: `PascalCase` with appropriate suffix (e.g., `UserCreate`, `UserResponse`)
- Dependency functions: `snake_case` with descriptive names (e.g., `get_current_user`, `get_db_session`)
- Router instances: `snake_case` (e.g., `users_router`, `auth_router`)
- Files: `snake_case.py` (e.g., `user_service.py`, `auth_router.py`)

## Formatting
- PEP 8: 4-space indentation, 88 chars line length (Black default)
- Imports: stdlib → third-party → local (alphabetical groups)
- Blank lines: 2 between top-level definitions
- Use Black + isort for consistent formatting

## Language-Specific Rules
- Use Pydantic v2 with `BaseModel` and `model_validator`:
```python
from pydantic import BaseModel, field_validator, model_validator

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str

    @field_validator('password')
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r'[A-Z]', v):
            raise ValueError('Must contain uppercase letter')
        return v

    @model_validator(mode='after')
    def passwords_match(self) -> 'CreateUserRequest':
        if self.password != self.confirm_password:
            raise ValueError('Passwords do not match')
        return self
```
- Use `Annotated` for dependency injection:
```python
from typing import Annotated

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User: ...
CurrentUser = Annotated[User, Depends(get_current_user)]

@router.get('/me')
async def read_me(user: CurrentUser):
    return user
```

## Anti-Patterns
- Using `sync` endpoints when `async` DB is available
- Catching broad `Exception` — use specific `HTTPException` with status codes
- Exposing internal model fields — always use response schemas
- Missing input validation — validate at Pydantic level, not in handler body

## Tooling
- Linter: `ruff` with FastAPI-related rules enabled
- Formatter: `black` + `isort`
- Type checker: `mypy` with `pydantic` plugin
