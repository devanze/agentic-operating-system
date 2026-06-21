# NestJS Testing

## Framework
- Unit: Jest (default with NestJS CLI)
- E2E: Jest + `supertest` for HTTP assertions
- Test runner: `jest` with `@nestjs/testing` utilities

## Conventions
- Test files co-located: `users.service.spec.ts`, `users.controller.spec.ts`
- E2E tests in `test/` directory: `app.e2e-spec.ts`
- Use `describe` blocks per class, `it` blocks per method

## Patterns

### Unit Testing a Service
```typescript
import { Test, TestingModule } from '@nestjs/testing';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useClass: MockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  it('finds user by email', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValue({ id: 1, email: 'test@test.com' });
    const result = await service.findByEmail('test@test.com');
    expect(result?.email).toBe('test@test.com');
    expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
  });
});
```

### Controller Testing with SuperTest (E2E)
```typescript
describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /users creates a user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'new@test.com', password: 'StrongPass1!' })
      .expect(201)
      .expect(res => {
        expect(res.body.data.email).toBe('new@test.com');
      });
  });

  afterAll(async () => { await app.close(); });
});
```

## Coverage
- Target: 90%+ for services and guards, 80%+ for controllers
- Tool: Jest built-in coverage (`--coverage`)
- Focus: service business logic, guard decisions, interceptor transformations
- Exclude: DTOs (test validation separately), entity definitions
