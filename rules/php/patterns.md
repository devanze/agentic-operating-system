# PHP Patterns

## Core Patterns

### Repository Pattern with PDO
```php
interface UserRepositoryInterface
{
    public function findById(int $id): ?User;
    public function findByEmail(string $email): ?User;
    public function save(User $user): User;
}

class PdoUserRepository implements UserRepositoryInterface
{
    public function __construct(private \PDO $pdo) {}

    public function findById(int $id): ?User
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $data = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $data ? $this->hydrate($data) : null;
    }

    public function save(User $user): User
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO users (email, name) VALUES (:email, :name) RETURNING id'
        );
        $stmt->execute(['email' => $user->email, 'name' => $user->name]);
        return new User((int)$this->pdo->lastInsertId(), $user->email, $user->name);
    }

    private function hydrate(array $data): User
    {
        return new User((int)$data['id'], $data['email'], $data['name']);
    }
}
```

### Service Container Pattern
```php
class Container
{
    private array $bindings = [];
    private array $instances = [];

    public function set(string $id, callable $factory): void
    {
        $this->bindings[$id] = $factory;
    }

    public function get(string $id): mixed
    {
        if (!isset($this->instances[$id])) {
            $this->instances[$id] = $this->bindings[$id]($this);
        }
        return $this->instances[$id];
    }
}

// Usage
$container = new Container();
$container->set(UserRepositoryInterface::class, fn($c) => new PdoUserRepository($c->get(\PDO::class)));
$container->set(UserService::class, fn($c) => new UserService($c->get(UserRepositoryInterface::class)));
```

### Middleware Pipeline
```php
interface MiddlewareInterface
{
    public function handle(Request $request, callable $next): Response;
}

class AuthMiddleware implements MiddlewareInterface
{
    public function __construct(private TokenService $tokenService) {}

    public function handle(Request $request, callable $next): Response
    {
        $token = $request->getHeader('Authorization');
        if (!$token || !$this->tokenService->validate($token)) {
            return new Response('Unauthorized', 401);
        }
        return $next($request);
    }
}
```

## Architecture
- MVC framework pattern: `Controllers/`, `Models/`, `Views/`
- Service layer between controllers and models
- Middleware for cross-cutting concerns (auth, logging, CORS)
- Dependency injection via container (or framework service provider)

## Common Idioms
- Nullsafe operator (`?->`) for optional chaining: `$user?->getAddress()?->getCity()`
- Named arguments (PHP 8+): `new User(email: 'a@b.com', name: 'Alice')`
- Constructor property promotion: `public function __construct(private $repo) {}`
- readonly properties for value objects

## Anti-Patterns
- Fat controllers — keep controllers thin, business logic in services
- Active Record in domain models — prefer data mapper pattern
- Static method calls to services — breaks testability
- God classes with > 500 lines — extract into smaller classes
