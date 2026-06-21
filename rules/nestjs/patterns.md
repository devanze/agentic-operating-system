# NestJS Patterns

## Core Patterns

### Module Architecture
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User]), MailModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```
- Each feature gets its own module
- Modules import dependencies, not inherit them
- Export providers that other modules need

### Guards for Authorization
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.roles?.includes(role));
  }
}
```

### Interceptors for Cross-Cutting
```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(map(data => ({ success: true, data, timestamp: new Date() })));
  }
}
```

## Architecture
- Feature-first folder structure: `users/`, `auth/`, `orders/`
- Each feature: controller, service, module, DTOs, entities
- Common layer: guards, interceptors, pipes, filters
- Config: `@nestjs/config` with typed config service

## Common Idioms
- `@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))`
- `@Query()` for GET parameters, `@Param()` for route params, `@Body()` for POST
- `@Req()` or `@Headers()` for request metadata
- CQRS module for complex domains with commands/queries

## Anti-Patterns
- Monolithic modules over 500 lines — split into sub-modules
- Services depending on HTTP context — use `@Res()` sparingly
- Catching and re-throwing generic `Error` — use `HttpException`
- Sharing mutable state across requests — use `Request-scoped` providers
