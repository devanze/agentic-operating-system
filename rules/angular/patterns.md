# Angular Patterns

## Core Patterns

### Smart / Dumb Components
```typescript
// Smart component (container) — handles data fetching
@Component({ selector: 'user-container' })
export class UserContainer {
  users = signal<User[]>([]);
  private service = inject(UserService);
  constructor() {
    effect(() => {
      this.service.getUsers().then(u => this.users.set(u));
    });
  }
}

// Dumb component (presentational) — displays data
@Component({ selector: 'user-card' })
export class UserCard {
  user = input.required<User>();
  @Output() selected = new EventEmitter<number>();
}
```

### State Management with Signals
```typescript
const state = signal({ users: [], loading: false, error: null });
const users = computed(() => state().users);
const isLoading = computed(() => state().loading);
```

### Repository Pattern via Services
```typescript
@Injectable({ providedIn: 'root' })
export class UserRepository {
  private http = inject(HttpClient);
  private cache = signal<Map<number, User>>(new Map());

  getById(id: number): Observable<User> {
    if (this.cache().has(id)) return of(this.cache().get(id)!);
    return this.http.get<User>(`/api/users/${id}`).pipe(
      tap(user => this.cache.update(m => new Map(m).set(id, user)))
    );
  }
}
```

## Architecture
- Feature modules: `features/users/` with components, services, models
- Core module: singleton services, guards, interceptors
- Shared module: reusable components, pipes, directives

## Common Idioms
- `@Input()` with signals: `input<T>()` and `input.required<T>()`
- `@Output()` with `output()` function (v19+)
- `resource()` API for async data with signals (v19+)

## Anti-Patterns
- Services with mutable state exposed directly
- Components over 300 lines — extract to sub-components
- Nested subscriptions without proper cleanup
- Using `ChangeDetectionStrategy.Default` — always use `OnPush`
