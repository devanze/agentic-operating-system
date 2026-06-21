---
name: django-patterns
description: Django patterns covering models, querysets, views, serializers, admin, signals, testing, and deployment. Use when building Django applications.
---

# Django Patterns

## Models
```python
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', 'status'])]

    def cancel(self):
        self.status = 'cancelled'
        self.save()
```

## Queryset Optimization
- `select_related()` for FK — single JOIN query
- `prefetch_related()` for M2M and reverse FK
- `.only()` / `.defer()` for column selection
- `.iterator()` for large datasets
- Avoid queries in template rendering

## Class-Based Views
- `ListView`, `DetailView`, `CreateView`, `UpdateView`, `DeleteView`
- Override `get_queryset()`, `get_context_data()`
- `LoginRequiredMixin`, `PermissionRequiredMixin`

## REST Framework
```python
class OrderViewSet(ModelViewSet):
    queryset = Order.objects.select_related('user').all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination
```
