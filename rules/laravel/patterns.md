# Laravel Patterns

## Core Patterns

### MVC with Eloquent
```php
// Controller
class OrderController extends Controller
{
    public function index(Request $request): View
    {
        $orders = Order::query()
            ->where('user_id', auth()->id())
            ->with('items.product')
            ->latest()
            ->paginate(20);

        return view('orders.index', compact('orders'));
    }

    public function store(StoreOrderRequest $request): RedirectResponse
    {
        $order = Order::create($request->validated());
        $order->items()->createMany($request->input('items'));
        event(new OrderPlaced($order));

        return redirect()->route('orders.show', $order)
            ->with('success', 'Order placed!');
    }
}
```

### Form Requests + Policies
```php
// Policy
class PostPolicy
{
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
}

// Form Request with Authorization
class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('post'));
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}

// Controller using Gate
public function update(UpdatePostRequest $request, Post $post): RedirectResponse
{
    $post->update($request->validated());
    return redirect()->route('posts.show', $post);
}
```

### Queued Jobs and Events
```php
// Job
class ProcessPodcast implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Podcast $podcast,
        public array $config
    ) {}

    public function handle(AudioProcessor $processor): void
    {
        $processor->process($this->podcast);
    }
}

// Event + Listener
class OrderShipped
{
    public function __construct(public Order $order) {}
}

class SendShipmentNotification implements ShouldQueue
{
    public function handle(OrderShipped $event): void
    {
        $event->order->user->notify(new OrderShippedNotification($event->order));
    }
}
```

## Architecture
- Standard Laravel structure: `app/Http/Controllers/`, `app/Models/`, `app/Services/`
- Service layer: `app/Services/` for business logic between controllers and models
- Action classes: `app/Actions/` for single-purpose operations
- Repository pattern optional — Eloquent models often suffice

## Common Idioms
- `Route::resource()` for RESTful controllers
- `$request->validate()` for one-off validation (FormRequest for complex)
- Local scopes: `public function scopeActive($query) { return $query->where('active', true); }`
- Accessors: `public function getFullNameAttribute(): string { return "$this->first_name $this->last_name"; }`
- `chunk()` or `cursor()` for large dataset processing

## Anti-Patterns
- Fat controllers with mixed concerns — use Form Requests + Actions
- Over-relying on `with()` in models — use `load()` in controllers
- `DB::raw()` in Eloquent queries without proper parameter binding
- N+1 queries — always use `with()` or `load()` for eager loading
