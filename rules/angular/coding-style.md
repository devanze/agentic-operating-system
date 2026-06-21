# Angular Coding Style

## Naming
- Components: `PascalCase` classes, `kebab-case` selectors (e.g., `@Component({ selector: 'user-profile' })`)
- Services: `PascalCase` with `Service` suffix (e.g., `AuthService`)
- Files: `.component.ts`, `.service.ts`, `.pipe.ts`, `.directive.ts`, `.guard.ts`
- Observables: suffix with `$` (e.g., `user$`, `isLoading$`)

## Formatting
- Angular CLI style: single quotes, no trailing semicolons (Prettier defaults)
- 2-space indentation
- Max 140 characters per line
- Organize imports: Angular core → third-party → application

## Language-Specific Rules
- Use `signals()` over RxJS `BehaviorSubject` for simple component state:
```typescript
// BAD — Subject for simple state
private isLoadingSubject = new BehaviorSubject<boolean>(false);
isLoading$ = this.isLoadingSubject.asObservable();

// GOOD — signal
isLoading = signal(false);
```
- Prefer `signal()` and `computed()` for synchronous derived state
- Use `effect()` only for side effects, never for state derivation
- Use `standalone: true` in components (default since v19)
- Prefer `inject()` over constructor injection:
```typescript
// GOOD
private http = inject(HttpClient);
private router = inject(Router);
```

## Anti-Patterns
- Subscribing manually without `AsyncPipe` in templates
- Mutating state directly instead of using signals/immutable updates
- Putting business logic in components — extract to services
- Using `any` type — define interfaces for all data models

## Tooling
- Linter: ESLint with `@angular-eslint/recommended`
- Formatter: Prettier with `plugin:@angular-eslint/template`
- Type checker: TypeScript `strict: true` in tsconfig.json
