# CodeIgniter 4 Coding Style

## Naming
- Controllers: `PascalCase` with `Controller` suffix (e.g., `UserController`, `OrderController`)
- Models: `PascalCase` with `Model` suffix (e.g., `UserModel`, `ProductModel`)
- Libraries: `PascalCase` (e.g., `PaymentGateway`, `MailService`)
- Helper functions: `snake_case` (e.g., `format_currency()`, `time_ago()`)
- Variables: `snake_case` (e.g., `$user_name`, `$is_active`)
- Routes: `snake_case` with HTTP method prefix (e.g., `$routes->get('users', 'UserController::index')`)
- Config files: `PascalCase` with `Config` suffix (e.g., `PaymentConfig`)

## Formatting
- PSR-12 standard: 4-space indentation, no tabs
- Opening braces on new line for classes, same line for methods
- One blank line between method definitions
- Max 120 characters per line
- Use strict types declaration in all new files

## Language-Specific Rules
- Use Entity classes for data objects:
```php
<?php

declare(strict_types=1);

namespace App\Entities;

use CodeIgniter\Entity\Entity;

class User extends Entity
{
    protected $attributes = [
        'id' => null,
        'email' => null,
        'name' => null,
        'status' => 'active',
    ];

    protected $casts = [
        'id' => 'int',
        'created_at' => 'datetime',
    ];

    public function getFullNameAttribute(): string
    {
        return "{$this->attributes['first_name']} {$this->attributes['last_name']}";
    }
}
```
- Use Model's built-in features over raw queries:
```php
<?php

class UserModel extends \CodeIgniter\Model
{
    protected $table = 'users';
    protected $primaryKey = 'id';
    protected $allowedFields = ['email', 'name', 'status', 'password_hash'];
    protected $useTimestamps = true;
    protected $useSoftDeletes = true;
    protected $validationRules = [
        'email' => 'required|valid_email|is_unique[users.email]',
        'name' => 'required|min_length[3]|max_length[100]',
    ];
}
```

## Anti-Patterns
- Putting business logic in controllers — use Models or Libraries
- Using `$db->query()` when Query Builder suffices — SQL injection risk
- Forgetting to escape views — use `esc()` function for output
- Leaving `ENVIRONMENT` constant undefined in `.env`
- Hardcoding base URLs — use `base_url()` or `site_url()` helpers

## Tooling
- Linter: PHP_CodeSniffer with CodeIgniter coding standard (`codeigniter4/coding-standard`)
- Formatter: PHP-CS-Fixer with PSR-12 rules
- Analyzer: PHPStan level 5+ (supports CodeIgniter via config)
