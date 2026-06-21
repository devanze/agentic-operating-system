# FastAPI Testing

## Framework
- Primary: `pytest` with `httpx` for async HTTP testing
- Test client: `httpx.AsyncClient` via `TestClient` from FastAPI
- Database: `pytest-asyncio` for async tests, `aiosqlite` for in-memory

## Conventions
- Test files: `test_<module>.py` alongside source or in `tests/` directory
- Fixtures in `conftest.py` at package root
- Async tests need `@pytest.mark.asyncio` decorator

## Patterns

### API Endpoint Testing with TestClient
```python
import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.fixture
def client():
    return AsyncClient(transport=ASGITransport(app=app), base_url='http://test')

@pytest.mark.asyncio
async def test_create_user_success(client: AsyncClient):
    response = await client.post('/api/v1/users/', json={
        'email': 'new@test.com',
        'password': 'StrongPass1!',
        'confirm_password': 'StrongPass1!',
    })
    assert response.status_code == 201
    data = response.json()
    assert data['email'] == 'new@test.com'
    assert 'id' in data
```

### Auth-dependent Endpoint Testing
```python
@pytest.mark.asyncio
async def test_get_current_user_requires_auth(client: AsyncClient):
    response = await client.get('/api/v1/users/me')
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_current_user_authenticated(client: AsyncClient, auth_headers: dict):
    response = await client.get('/api/v1/users/me', headers=auth_headers)
    assert response.status_code == 200
    assert response.json()['email'] == 'test@test.com'
```

### Database Integration Testing
```python
@pytest.fixture
async def test_db():
    async with async_session_maker() as session:
        # Seed data
        session.add(User(email='existing@test.com', password_hash='hash'))
        await session.commit()
        yield session

@pytest.mark.asyncio
async def test_duplicate_email_returns_409(client: AsyncClient, test_db: AsyncSession):
    response = await client.post('/api/v1/users/', json={
        'email': 'existing@test.com',
        'password': 'StrongPass1!',
        'confirm_password': 'StrongPass1!',
    })
    assert response.status_code == 409
    assert 'already registered' in response.json()['detail'].lower()
```

## Coverage
- Target: 90%+ for route handlers, services, and validation logic
- Tool: `pytest-cov` with `coverage`
- Command: `pytest --cov=app --cov-report=term-missing --cov-fail-under=90`
- Focus: API responses, validation errors, auth checks, edge cases
