# Django Coding Style

## Naming
- Models: `PascalCase` singular (e.g., `BlogPost`, `UserProfile`)
- Views: `PascalCase` with view type suffix (e.g., `PostListView`, `PostDetailView`)
- URLs: `snake_case` (e.g., `post-list`, `user-profile`)
- Templates: `snake_case` matching view/template name (e.g., `post_list.html`)
- Management commands: `snake_case` (e.g., `sync_users`)

## Formatting
- PEP 8: 4-space indentation, 79 chars max (88 with Black)
- Blank lines: 2 between classes, 1 between methods
- Imports: stdlib → Django → third-party → local (alphabetical groups)
- Use Black formatter + isort for imports

## Language-Specific Rules
- Use class-based views over function views for complex views:
```python
# GOOD — CBV with mixins
class PostUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Post
    fields = ['title', 'content']
    template_name = 'posts/post_form.html'

    def test_func(self):
        return self.get_object().author == self.request.user
```
- Use `select_related()` and `prefetch_related()` to avoid N+1:
```python
posts = Post.objects.select_related('author').prefetch_related('tags').all()
```
- Use `@transaction.atomic` for multi-step operations:
```python
@transaction.atomic
def transfer_funds(sender, recipient, amount):
    sender.balance -= amount
    sender.save()
    recipient.balance += amount
    recipient.save()
```

## Anti-Patterns
- Fat models with business logic — use service layer
- Raw SQL when ORM suffices (except for complex reporting)
- Signals for core business logic — use explicit method calls
- Circular model imports — use `apps.get_model()` or string references

## Tooling
- Linter: `flake8` or `ruff` with Django plugin
- Formatter: `black` with line-length 88
- Type checker: `mypy` with `django-stubs`
