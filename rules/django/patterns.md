# Django Patterns

## Core Patterns

### MVT (Model-View-Template)
```python
# models.py
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=CASCADE, related_name='orders')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

# views.py
class OrderListView(LoginRequiredMixin, ListView):
    model = Order
    template_name = 'orders/list.html'
    paginate_by = 20

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).select_related('user')
```

### DRF Serializers + ViewSets
```python
# serializers.py
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'total', 'status', 'items', 'created_at']

# views.py
class OrderViewSet(ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
```

### Middleware for Cross-Cutting
```python
class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        logger.info(f'{request.method} {request.path}')
        response = self.get_response(request)
        logger.info(f'Response: {response.status_code}')
        return response
```

## Architecture
- Apps organized by domain: `users/`, `orders/`, `payments/`, `inventory/`
- Templates mirrored in `templates/<app>/` for each app
- Static files: `static/<app>/` per app, or central `static/` for shared

## Common Idioms
- `get_object_or_404(Model, pk=id)` for single object access
- `@login_required` and `@permission_required` decorators on function views
- `Q()` objects for complex OR queries: `Q(status='active') | Q(priority=1)`
- Context processors for global template variables

## Anti-Patterns
- Fat views — move query logic to `get_queryset()` or managers
- Forgetting `select_related()` on foreign keys in lists
- Hardcoding URLs — always use `{% url %}` or `reverse()`
- Signals as pub/sub bus — they're synchronous and can cause circular saves
