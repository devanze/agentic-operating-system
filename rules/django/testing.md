# Django Testing

## Framework
- Primary: `unittest.TestCase` via Django's `TestCase`
- Alternative: `pytest` with `pytest-django` plugin (recommended for larger projects)
- API testing: Django REST Framework's `APITestCase` or `APIClient`

## Conventions
- Test files: `tests.py` per app, or `tests/` package with `test_models.py`, `test_views.py`
- Test methods prefixed with `test_` (pytest) or `def test_*` (unittest)
- Factories over fixtures: use `factory_boy` for model instances

## Patterns

### Model and Query Testing
```python
import pytest
from django.db import connection

@pytest.mark.django_db
def test_active_orders_query():
    user = UserFactory()
    OrderFactory.create_batch(3, user=user, status='active')
    OrderFactory.create_batch(2, user=user, status='cancelled')

    active = Order.objects.active().count()
    assert active == 3
    assert Order.objects.filter(status='cancelled').count() == 2
```

### View Testing with Client
```python
def test_authenticated_user_sees_own_orders(client):
    user = UserFactory()
    client.force_login(user)
    order = OrderFactory(user=user)

    response = client.get(reverse('order-list'))

    assert response.status_code == 200
    assert order.total in response.content.decode()
```

### API Testing with DRF
```python
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

class OrderAPITests(APITestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)

    def test_create_order_requires_auth(self):
        self.client.force_authenticate(user=None)
        response = self.client.post('/api/orders/', {'total': 50})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_orders_paginated(self):
        OrderFactory.create_batch(25, user=self.user)
        response = self.client.get('/api/orders/')
        assert response.status_code == 200
        assert len(response.data['results']) == 20  # default page size
```

## Coverage
- Target: 90%+ for models and views, 80%+ overall
- Tool: `coverage.py` with `pytest-cov`
- Command: `coverage run -m pytest && coverage report --fail-under=80`
- Focus: model methods, view authorization, serializer validation, queryset logic
