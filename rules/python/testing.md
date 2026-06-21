# Python Testing

## pytest as Test Runner

```python
# test_<name>.py — pytest discovers by default
def test_add_returns_sum():
    assert add(2, 3) == 5

def test_add_with_negative():
    assert add(-1, 1) == 0
```

## Fixtures for Shared Setup

```python
import pytest

@pytest.fixture
def db_session():
    """Provide a clean database session for each test."""
    session = create_test_session()
    populate_test_data(session)
    yield session
    session.close()
    drop_test_data()

@pytest.fixture
def sample_user(db_session):
    """A reusable test user."""
    return create_user(db_session, email="test@example.com")


def test_find_user(sample_user, db_session):
    found = find_user(db_session, sample_user.id)
    assert found is not None
    assert found.email == "test@example.com"
```

## Parametrize for Multiple Inputs

```python
@pytest.mark.parametrize("email,expected", [
    ("user@example.com", True),
    ("not-an-email", False),
    ("", False),
    ("user+tag@example.com", True),
])
def test_validate_email(email, expected):
    assert is_valid_email(email) == expected
```

## Mocking with unittest.mock / pytest-mock

```python
from unittest.mock import patch, Mock

def test_fetch_user_calls_api(mocker):
    """Mock external HTTP call."""
    mock_response = Mock()
    mock_response.json.return_value = {"id": 1, "name": "John"}
    mocker.patch("requests.get", return_value=mock_response)

    result = fetch_user(1)
    assert result["name"] == "John"

def test_fetch_user_handles_error(mocker):
    mocker.patch("requests.get", side_effect=ConnectionError("timeout"))

    with pytest.raises(ServiceError):
        fetch_user(1)
```

## Coverage with pytest-cov

```bash
pytest --cov=src/ --cov-report=term-missing --cov-fail-under=80
```

## Testing Django with pytest-django

```python
@pytest.mark.django_db
def test_create_user():
    user = User.objects.create(email="test@test.com")
    assert User.objects.count() == 1
```

## Testing FastAPI with TestClient

```python
from fastapi.testclient import TestClient

client = TestClient(app)

def test_create_user():
    response = client.post("/users", json={"email": "a@b.com", "name": "A"})
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "a@b.com"
```

## Async Test Support

```python
@pytest.mark.asyncio
async def test_async_service():
    result = await my_service.process()
    assert result.success is True
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `assert True == func()` | `assert func() == expected` | Equality reads left-to-right |
| `@pytest.fixture` that modifies DB | Fixture yields with cleanup | Leaked state pollutes other tests |
| Mocking the function under test | Mock external dependencies only | Mocking SUT defeats the test's purpose |
