---
name: nestjs-patterns
description: NestJS patterns covering modules, decorators, dependency injection, guards, interceptors, pipes, and testing. Use when building NestJS backends.
---

# NestJS Patterns

## Module Architecture
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

## Decorators
- `@Controller('users')` — route prefix
- `@Get(':id')`, `@Post()`, `@Patch(':id')`, `@Delete(':id')`
- `@Body()`, `@Param()`, `@Query()`, `@Headers()`
- `@UseGuards(AuthGuard)`, `@UseInterceptors(LoggingInterceptor)`

## Dependency Injection
```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}
}
```

## Guards & Interceptors
- Guards: `canActivate()` returns boolean — auth/authorization
- Interceptors: `intercept()` wraps handler — logging, transform, cache
- Pipes: `transform()` — validation, transformation
- Filters: `catch()` — exception handling

## Validation
```typescript
export class CreateUserDto {
  @IsEmail()
  email: string

  @MinLength(8)
  password: string

  @IsOptional()
  @IsString()
  name?: string
}
```
