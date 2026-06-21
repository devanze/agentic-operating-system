# PHP Testing

## Framework
- Primary: PHPUnit (`phpunit/phpunit`) — most widely used
- Alternative: Pest (`pestphp/pest`) — modern, expressive syntax
- Mocking: PHPUnit's built-in mocks or `mockery/mockery`

## Conventions
- Test files: `*Test.php` suffix in `tests/` directory (e.g., `UserServiceTest.php`)
- Mirror `src/` structure in `tests/`
- Class names: `UserServiceTest extends TestCase`
- Use `setUp()` and `tearDown()` for test lifecycle

## Patterns

### Unit Testing with PHPUnit
```php
use PHPUnit\Framework\TestCase;

class UserServiceTest extends TestCase
{
    private UserRepositoryInterface $repo;
    private UserService $service;

    protected function setUp(): void
    {
        $this->repo = $this->createMock(UserRepositoryInterface::class);
        $this->service = new UserService($this->repo);
    }

    public function testFindByIdReturnsUserWhenFound(): void
    {
        $user = new User(1, 'alice@test.com', 'Alice');
        $this->repo
            ->expects($this->once())
            ->method('findById')
            ->with(1)
            ->willReturn($user);

        $result = $this->service->findById(1);

        $this->assertNotNull($result);
        $this->assertEquals('Alice', $result->getName());
    }

    public function testFindByIdReturnsNullWhenNotFound(): void
    {
        $this->repo
            ->expects($this->once())
            ->method('findById')
            ->with(99)
            ->willReturn(null);

        $result = $this->service->findById(99);

        $this->assertNull($result);
    }

    public function testCreateThrowsExceptionOnDuplicateEmail(): void
    {
        $this->repo
            ->expects($this->once())
            ->method('findByEmail')
            ->with('existing@test.com')
            ->willReturn(new User(1, 'existing@test.com', 'Existing'));

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Email already registered');

        $this->service->create('existing@test.com', 'pass', 'Test');
    }
}
```

### Integration Testing with TestContainer
```php
class UserRepositoryTest extends TestCase
{
    private static \PDO $pdo;
    private PdoUserRepository $repo;

    public static function setUpBeforeClass(): void
    {
        self::$pdo = new \PDO('sqlite::memory:');
        self::$pdo->exec('CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, name TEXT)');
    }

    protected function setUp(): void
    {
        self::$pdo->exec('DELETE FROM users');
        $this->repo = new PdoUserRepository(self::$pdo);
    }

    public function testSaveInsertsAndReturnsUserWithId(): void
    {
        $user = $this->repo->save(new User(0, 'new@test.com', 'New User'));

        $this->assertNotNull($user->getId());
        $this->assertGreaterThan(0, $user->getId());
        $this->assertEquals('new@test.com', $user->getEmail());
    }
}
```

### Pest Syntax (Alternative)
```php
it('creates a user successfully', function () {
    $service = new UserService(new InMemoryUserRepository());

    $user = $service->create('test@test.com', 'password', 'Test');

    expect($user)->not->toBeNull()
        ->and($user->getEmail())->toBe('test@test.com')
        ->and($user->getName())->toBe('Test');
});
```

## Coverage
- Target: 90%+ for services, 80%+ overall
- Tool: `phpunit --coverage-html coverage/` with Xdebug or PCOV
- CI: `vendor/bin/phpunit --coverage-clover coverage.xml --coverage-text`
- Focus: service business logic, edge cases, validation, boundary values
