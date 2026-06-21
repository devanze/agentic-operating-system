# Laravel Testing

## Framework
- Primary: PHPUnit (built-in with Laravel)
- HTTP testing: Laravel's `get()`, `post()`, `assertStatus()`, `assertJson()`
- Browser testing: Laravel Dusk (headless Chrome) for UI testing
- Factories: Eloquent factories with `Factory::factoryForModel()` or `HasFactory` trait

## Conventions
- Test files: `*Test.php` in `tests/` directory (e.g., `OrderControllerTest.php`)
- Three test suites: `Unit/`, `Feature/`, `Browser/`
- Database: `RefreshDatabase` or `DatabaseMigrations` trait for test isolation
- Factory definitions in `database/factories/`

## Patterns

### Feature Testing with HTTP assertions
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_their_orders(): void
    {
        $user = User::factory()->create();
        Order::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/orders');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [['id', 'status', 'total', 'created_at']],
            ]);
    }

    public function test_unauthenticated_user_cannot_create_order(): void
    {
        $response = $this->postJson('/api/orders', [
            'items' => [['product_id' => 1, 'quantity' => 2]],
        ]);

        $response->assertStatus(401);
    }

    public function test_user_can_create_order_with_valid_data(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 1000]);

        $response = $this->actingAs($user)
            ->postJson('/api/orders', [
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 2],
                ],
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('orders', ['user_id' => $user->id]);
        $this->assertEquals(2000, $response->json('data.total'));
    }
}
```

### Unit Testing Eloquent Scopes
```php
class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_scope_returns_only_active_orders(): void
    {
        Order::factory()->create(['status' => 'active']);
        Order::factory()->create(['status' => 'cancelled']);
        Order::factory()->create(['status' => 'active']);

        $activeOrders = Order::active()->get();

        $this->assertCount(2, $activeOrders);
    }

    public function test_order_total_is_calculated_correctly(): void
    {
        $order = Order::factory()->hasItems(3, [
            'price' => 500,
            'quantity' => 2,
        ])->create();

        $this->assertEquals(3000, $order->total); // 3 items × 500 × 2 qty
    }
}
```

### Browser Testing with Dusk
```php
<?php

namespace Tests\Browser;

use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class LoginTest extends DuskTestCase
{
    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'user@test.com',
            'password' => bcrypt('password123'),
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->visit('/login')
                ->type('email', $user->email)
                ->type('password', 'password123')
                ->press('Login')
                ->assertPathIs('/dashboard')
                ->assertSee('Dashboard');
        });
    }
}
```

## Coverage
- Target: 90%+ for services and models, 80%+ for controllers
- Tool: PHPUnit coverage (`phpunit --coverage-html coverage/`)
- Command: `php artisan test --coverage` (Laravel 11+)
- Focus: Eloquent scopes, Form Request validation, Policy authorization, Job processing
