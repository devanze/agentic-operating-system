# Python Patterns

## Async/Await for I/O-bound Work

```python
# BAD — sequential HTTP calls
def fetch_all(urls):
    results = []
    for url in urls:
        results.append(requests.get(url).json())
    return results

# GOOD — parallel async calls
async def fetch_all(urls: list[str]) -> list[dict]:
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_one(session, url) for url in urls]
        return await asyncio.gather(*tasks, return_exceptions=True)
```

## Decorators for Cross-cutting Concerns

```python
from functools import wraps
import time

def timed(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:
            elapsed = time.perf_counter() - start
            logger.info(f"{func.__name__} took {elapsed:.3f}s")
    return wrapper

@timed
def expensive_query():
    ...
```

## Property-based Design

```python
class Temperature:
    def __init__(self, celsius: float):
        self._celsius = celsius

    @property
    def celsius(self) -> float:
        return self._celsius

    @property
    def fahrenheit(self) -> float:
        return self._celsius * 9/5 + 32

    @celsius.setter
    def celsius(self, value: float):
        if value < -273.15:
            raise ValueError("Below absolute zero")
        self._celsius = value
```

## Dependency Injection (FastAPI-style)

```python
from fastapi import Depends, FastAPI
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI()

async def get_db():
    async with SessionLocal() as session:
        yield session

async def get_current_user(token: str = Depends(oauth2_scheme),
                            db: AsyncSession = Depends(get_db)) -> User:
    ...

@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
```

## Configuration with Pydantic Settings

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    api_key: str
    debug: bool = False
    max_connections: int = 10

    class Config:
        env_file = ".env"

settings = Settings()
```

## ORM: Avoiding N+1

```python
# BAD — N+1 queries
users = db.query(User).all()
for user in users:  # Each iteration fires another query
    print(user.profile.bio)

# GOOD — eager load
users = db.query(User).options(joinedload(User.profile)).all()
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| Mutable default args: `def f(x=[])` | `def f(x=None)` then `x = x or []` | Default is shared across calls |
| `async` for CPU-bound work | `asyncio.to_thread()` or multiprocessing | Async doesn't bypass GIL |
| `if __name__ == "__main__":` with no function | Wrap in `main()` function | Unstructured code in global scope |
