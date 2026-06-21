# PHP Coding Style

## Naming
- Classes: `PascalCase` (e.g., `UserService`, `OrderController`)
- Interfaces: `PascalCase` with `Interface` suffix (e.g., `UserRepositoryInterface`)
- Traits: `PascalCase` with `Trait` suffix (e.g., `LoggableTrait`)
- Methods: `camelCase` (e.g., `getUserById()`, `calculateTotal()`)
- Variables: `camelCase` (e.g., `$userName`, `$isActive`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)
- Files: `PascalCase.php` matching class name (PSR-4 autoloading)

## Formatting
- 4-space indentation (no tabs) — PSR-2/PSR-12
- Opening brace on new line for classes, same line for methods
- Namespace declaration on its own line after `<?php`
- Max 120 characters per line (PSR-2 recommends 80 soft limit)
- One blank line between `namespace` and `use` statements

## Language-Specific Rules
- Use typed properties and return types (PHP 7.4+):
```php
class User
{
    public readonly int $id;
    private string $email;
    protected ?string $name = null;
    private \DateTimeImmutable $createdAt;

    public function __construct(int $id, string $email)
    {
        $this->id = $id;
        $this->email = $email;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getEmail(): string
    {
        return $this->email;
    }
}
```
- Use PHP 8 enums for fixed value sets:
```php
enum OrderStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
}
```
- Use `match` expression over `switch`:
```php
$statusLabel = match ($order->status) {
    OrderStatus::Pending => 'Awaiting payment',
    OrderStatus::Shipped => 'On its way',
    OrderStatus::Delivered => 'Completed',
    default => 'Unknown',
};
```

## Anti-Patterns
- Using `mysql_*` functions — always use PDO or an ORM
- `global` keyword — use dependency injection instead
- `extract()` — leads to variable collisions
- Die/dump in production code — use proper logging
- Long inline HTML in PHP files — use templates/views

## Tooling
- Linter: PHP_CodeSniffer (`phpcs`) with PSR-12 ruleset
- Formatter: PHP-CS-Fixer with PSR-12 rules
- Analyzer: PHPStan (level 6+) or Psalm for static analysis
