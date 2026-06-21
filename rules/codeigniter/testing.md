# CodeIgniter 4 Testing

## Framework
- Primary: PHPUnit (built-in with CI4 via `codeigniter4/testing`)
- Database: CI4's `DatabaseTestTrait` for database testing
- Feature: `FeatureTestCase` for HTTP request testing
- Mocking: PHPUnit mocks or `Mockery`

## Conventions
- Test files: `*Test.php` in `tests/` directory (e.g., `UserModelTest.php`)
- Mirror `app/` structure in `tests/` (e.g., `tests/Models/`, `tests/Controllers/`)
- Use `setUp()` and `tearDown()` for test lifecycle
- Database tests: extend `CIDatabaseTestCase` or use `DatabaseTestTrait`

## Patterns

### Model Unit Testing
```php
<?php

use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\DatabaseTestTrait;
use App\Models\UserModel;
use App\Entities\User;

class UserModelTest extends CIUnitTestCase
{
    use DatabaseTestTrait;

    protected $migrate = true;
    protected $seed = 'App\Database\Seeds\UserSeeder';

    public function testFindByEmailReturnsUser(): void
    {
        $model = model(UserModel::class);

        $user = $model->where('email', 'alice@test.com')->first();

        $this->assertNotNull($user);
        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('alice@test.com', $user->email);
    }

    public function testCreateUserWithInvalidEmailFails(): void
    {
        $model = model(UserModel::class);

        $result = $model->insert([
            'email' => 'not-an-email',
            'name' => 'Test',
            'password_hash' => 'hash',
        ]);

        $this->assertFalse($result);
        $this->assertNotEmpty($model->errors());
    }

    public function testSoftDeleteSetsDeletedAt(): void
    {
        $model = model(UserModel::class);
        $userId = $model->insert([
            'email' => 'delete@test.com',
            'name' => 'To Delete',
            'password_hash' => 'hash',
        ]);

        $model->delete($userId);

        $deleted = $model->onlyDeleted()->find($userId);
        $this->assertNotNull($deleted);
        $this->assertNotNull($deleted->deleted_at);
    }
}
```

### Controller Feature Testing
```php
<?php

use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\FeatureTestTrait;
use App\Models\UserModel;

class UserControllerTest extends CIUnitTestCase
{
    use FeatureTestTrait;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withSession(['isLoggedIn' => true, 'userId' => 1]);
    }

    public function testIndexReturnsUserList(): void
    {
        $response = $this->get('users');

        $response->assertStatus(200);
        $response->assertSee('User List');
    }

    public function testCreateWithValidDataRedirects(): void
    {
        $response = $this->withBody(json_encode([
            'email' => 'new@test.com',
            'password' => 'StrongPass1!',
            'name' => 'New User',
        ]))->post('users/create');

        $response->assertStatus(302);
        $this->assertTrue(session()->has('success'));
    }

    public function testUnauthenticatedUserIsRedirected(): void
    {
        $this->withSession([]); // clear session

        $response = $this->get('users');

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Please login first');
    }
}
```

### Service Testing with Mocking
```php
<?php

use CodeIgniter\Test\CIUnitTestCase;
use App\Services\UserService;

class UserServiceTest extends CIUnitTestCase
{
    public function testRegisterCreatesUserAndSendsEmail(): void
    {
        $model = $this->createMock(\App\Models\UserModel::class);
        $mailService = $this->createMock(\App\Services\MailService::class);

        $model->expects($this->once())
            ->method('insert')
            ->willReturn(1);

        $model->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn(new \App\Entities\User(['id' => 1, 'email' => 'test@test.com']));

        $mailService->expects($this->once())
            ->method('sendWelcome')
            ->with($this->isInstanceOf(\App\Entities\User::class));

        $service = new UserService($model, $mailService);
        $user = $service->register([
            'email' => 'test@test.com',
            'password' => 'Strong1!',
            'name' => 'Test',
        ]);

        $this->assertInstanceOf(\App\Entities\User::class, $user);
        $this->assertEquals('test@test.com', $user->email);
    }
}
```

## Coverage
- Target: 90%+ for services and models, 80%+ for controllers
- Tool: PHPUnit coverage (`phpunit --coverage-html build/coverage`)
- CI: `vendor/bin/phpunit --coverage-clover build/logs/clover.xml`
- Focus: Model validation rules, service business logic, filter/guard behavior
