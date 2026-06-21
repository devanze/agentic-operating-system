# Angular Testing

## Framework
- Primary: Jasmine (`describe`, `it`, `expect`)
- Test runner: Karma (legacy) or Jest (via `@angular-builders/jest`)
- Component harness: `@angular/cdk/testing` for material components

## Conventions
- Test files co-located with source: `user.component.spec.ts`, `auth.service.spec.ts`
- Mirror source directory structure under `src/app/`
- Test files end with `.spec.ts` (Karma default) or `.test.ts` (Jest)

## Patterns

### Component Testing with TestBed
```typescript
describe('UserProfileComponent', () => {
  let fixture: ComponentFixture<UserProfileComponent>;
  let component: UserProfileComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileComponent], // standalone
      providers: [provideHttpClient(withInterceptorsFromDi())],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('displays user name when provided', () => {
    const nameEl = fixture.nativeElement.querySelector('.user-name');
    expect(nameEl.textContent).toContain('John');
  });
});
```

### Service Testing with HttpTestingController
```typescript
let service: UserService;
let httpMock: HttpTestingController;

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
  });
  service = TestBed.inject(UserService);
  httpMock = TestBed.inject(HttpTestingController);
});

it('fetches users via GET', () => {
  service.getUsers().subscribe(users => expect(users.length).toBe(2));
  const req = httpMock.expectOne('/api/users');
  expect(req.request.method).toBe('GET');
  req.flush([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
  httpMock.verify();
});
```

## Coverage
- Target: 80%+ line and branch coverage
- Tool: Jest coverage or Karma + karma-coverage
- Commands: `ng test --no-watch --code-coverage` or `jest --coverage`
- Focus coverage on: services (90%), components (80%), pipes (100%), guards (100%)
