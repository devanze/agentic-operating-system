# Python Coding Style

## Formatting & Linting

- PEP 8: 4-space indent, 79-char lines (88 if using Black)
- Run `black` for formatting, `ruff` for linting — zero-config defaults
- `isort` for import ordering: stdlib → third-party → local

```python
# imports grouped by isort
import os
import sys
from typing import Optional

import pytest
from pydantic import BaseModel

from myapp.models import User
from myapp.services import auth_service
```

## Type Hints

- Annotate all public functions:

```python
# BAD — no type hints
def get_user(id, db):
    return db.query(f"SELECT * FROM users WHERE id = {id}")

# GOOD — typed and safe
def get_user(user_id: int, db: Database) -> User | None:
    return db.query(User).filter(User.id == user_id).first()
```

- Use `Optional[T]` (pre-3.10) or `T | None` (3.10+):

```python
def find(email: str) -> User | None: ...
```

## Dataclasses for Data Containers

```python
from dataclasses import dataclass

@dataclass(frozen=True)  # immutable
class UserDTO:
    id: int
    email: str
    name: str = ""  # default value
```

## F-Strings Over Legacy Formatting

```python
# BAD
name = "World"
print("Hello, %s!" % name)
print("Hello, {}!".format(name))

# GOOD
print(f"Hello, {name}!")
print(f"User {user.id}: {user.email} ({user.role})")
```

## Context Managers (with)

```python
# BAD — manual resource management
f = open("file.txt")
try:
    data = f.read()
finally:
    f.close()

# GOOD — context manager handles cleanup
with open("file.txt") as f:
    data = f.read()

# Custom context manager
@contextmanager
def db_session():
    session = Session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
```

## Walrus Operator (:=) — Use Sparingly

```python
# BAD — repeated expression
data = parser.parse(text)
if data is not None:
    process(data)

# GOOD — assign and test in one expression
if (data := parser.parse(text)) is not None:
    process(data)
```

## pathlib Over os.path

```python
# BAD
path = os.path.join(os.getcwd(), "data", "config.json")
if os.path.exists(path):
    with open(path) as f: ...

# GOOD
path = Path.cwd() / "data" / "config.json"
if path.exists():
    content = path.read_text()
```

## Exception Handling

```python
# BAD — bare except
try:
    result = risky_operation()
except:
    pass

# GOOD — specific exceptions
try:
    result = risky_operation()
except ValueError as e:
    logger.error("Invalid value: %s", e)
    raise
except ConnectionError:
    return fallback_value
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `except: pass` | `except SpecificError:` | Silences KeyboardInterrupt, SystemExit |
| `from os import *` | `import os` | Pollutes namespace, unclear origins |
| `x = [] if x is None else x` | `x = x or []` | or-idiom is Pythonic for None/empty |
| `' '.join([f(x) for x in items])` | `' '.join(f(x) for x in items)` | Generator avoids intermediate list |
