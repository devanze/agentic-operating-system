# CodeIgniter 4 Patterns

## Core Patterns

### Service Layer Pattern
```php
<?php

namespace App\Services;

use App\Models\UserModel;
use App\Entities\User;

class UserService
{
    public function __construct(
        private UserModel $userModel,
        private MailService $mailService
    ) {}

    public function register(array $data): User
    {
        $this->validateUniqueness($data['email']);

        $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        unset($data['password']);

        $userId = $this->userModel->insert($data);
        $user = $this->userModel->find($userId);

        $this->mailService->sendWelcome($user);

        return $user;
    }

    public function findByEmail(string $email): ?User
    {
        return $this->userModel->where('email', $email)->first();
    }

    private function validateUniqueness(string $email): void
    {
        if ($this->userModel->where('email', $email)->first()) {
            throw new \RuntimeException('Email already registered');
        }
    }
}
```

### Query Builder Pattern
```php
<?php

namespace App\Models;

class OrderModel extends \CodeIgniter\Model
{
    protected $table = 'orders';
    protected $allowedFields = ['user_id', 'status', 'total'];

    public function findPendingOrders(int $userId): array
    {
        return $this->select('orders.*, products.name as product_name')
            ->join('order_items', 'order_items.order_id = orders.id')
            ->join('products', 'products.id = order_items.product_id')
            ->where('orders.user_id', $userId)
            ->where('orders.status', 'pending')
            ->orderBy('orders.created_at', 'DESC')
            ->findAll();
    }

    public function getMonthlyReport(int $year, int $month): array
    {
        return $this->select("
            DATE(created_at) as date,
            COUNT(*) as order_count,
            SUM(total) as revenue
        ")
        ->where('YEAR(created_at)', $year)
        ->where('MONTH(created_at)', $month)
        ->where('status !=', 'cancelled')
        ->groupBy('DATE(created_at)')
        ->findAll();
    }
}
```

### Filter (Middleware) Pattern
```php
<?php

namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;

class AuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        if (!session()->get('isLoggedIn')) {
            return redirect()->to('/login')
                ->with('error', 'Please login first');
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Log the request
        log_message('info', 'Request: ' . $request->getPath());
    }
}
```

## Architecture
- Standard CI4: `app/Controllers/`, `app/Models/`, `app/Views/`, `app/Libraries/`
- Services in `app/Services/` for business logic
- Entities in `app/Entities/` for data objects
- Filters in `app/Filters/` for middleware-style request processing

## Common Idioms
- `$this->validate($rules)` in controllers for input validation
- `esc($var)` in views for XSS-safe output
- `session()->getFlashdata('key')` for flash messages
- `$this->request->getJSON()` for API JSON input
- `$this->response->setStatusCode()->setJSON($data)` for JSON responses

## Anti-Patterns
- Fat controllers with SQL queries — use Models
- `global $db` — use dependency injection via service container
- Overusing `helper()` inside views — register in BaseController
- Ignoring `$allowedFields` in Model — mass assignment vulnerability
- Hardcoded config values — use `Config` classes
