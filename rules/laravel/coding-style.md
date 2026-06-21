# Laravel Coding Style

## Naming
- Models: `PascalCase` singular (e.g., `BlogPost`, `UserProfile`)
- Controllers: `PascalCase` with `Controller` suffix (e.g., `UserController`, `OrderController`)
- Migrations: `snake_case` with date prefix (e.g., `2024_01_15_000001_create_users_table`)
- Policies: `PascalCase` with `Policy` suffix (e.g., `PostPolicy`)
- Form Requests: `PascalCase` with `Request` suffix (e.g., `StoreUserRequest`)
- Jobs: `PascalCase` with `Job` suffix (e.g., `SendWelcomeEmail`)
- Service providers: `PascalCase` with `ServiceProvider` suffix

## Formatting
- PSR-12 (same as PHP): 4-space indentation, braces on new line for classes
- Use Laravel's default formatting — avoid fighting conventions
- Eloquent queries on multiple lines for readability
- Route closures inline for simple routes only

## Language-Specific Rules
- Use Facades judiciously — prefer dependency injection when possible:
```php
// BAD — Facade in deep business logic
public function processOrder(int $id): void
{
    $order = \DB::table('orders')->find($id);
    \Mail::raw('Processed', function ($msg) use ($order) { ... });
}

// GOOD — injected dependencies
public function __construct(
    private OrderRepository $orders,
    private MailService $mail
) {}

public function processOrder(int $id): void
{
    $order = $this->orders->find($id);
    $this->mail->send('Processed', $order);
}
```
- Use Eloquent relationships over manual joins:
```php
class User extends Authenticatable
{
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function recentPosts(): HasMany
    {
        return $this->hasMany(Post::class)
            ->where('published_at', '>=', now()->subMonth())
            ->latest();
    }
}
```
- Use Form Requests for validation:
```php
class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Gate logic via Policy
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', Rule::unique('users')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'name' => ['required', 'string', 'max:255'],
        ];
    }
}
```

## Anti-Patterns
- Putting queries in Blade templates — eager load in controller
- Using `dd()` or `dump()` in committed code — use logging
- Overusing `php artisan make:...` — understand what each generates
- Magic numbers in config — use config files and env vars

## Tooling
- Linter: Laravel Pint (built-in PSR-12 + Laravel conventions)
- Formatter: Laravel Pint (`./vendor/bin/pint`)
- Analyzer: Larastan (PHPStan for Laravel)
