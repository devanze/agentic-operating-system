# NestJS Coding Style

## Naming
- Controllers: `PascalCase` with `Controller` suffix (e.g., `UsersController`)
- Services: `PascalCase` with `Service` suffix (e.g., `AuthService`)
- DTOs: `PascalCase` with `Dto` suffix (e.g., `CreateUserDto`)
- Modules: `PascalCase` with `Module` suffix (e.g., `DatabaseModule`)
- Files: `users.controller.ts`, `auth.service.ts`, `create-user.dto.ts`

## Formatting
- 2-space indentation
- Single quotes for strings
- Semicolons required
- Max 120 characters per line
- Blank line between class properties and constructor

## Language-Specific Rules
- Use `@Injectable()` for all providers with explicit scope:
```typescript
@Injectable({ scope: Scope.DEFAULT }) // singleton by default
export class UserService {}
```
- Use validation decorators on DTOs with `class-validator`:
```typescript
export class CreateUserDto {
  @IsEmail() email: string;
  @MinLength(8) @MaxLength(128) password: string;
  @IsOptional() @IsString() name?: string;
}
```
- Define API operations with explicit decorators:
```typescript
@ApiOperation({ summary: 'Create user' })
@ApiCreatedResponse({ type: UserEntity })
@Post()
async create(@Body() dto: CreateUserDto): Promise<UserEntity> {}
```

## Anti-Patterns
- Business logic in controllers — extract to services
- Direct repository access in controllers
- Missing `await` on async service calls
- Overusing `any` instead of proper DTO types
- Circular module imports — use `forwardRef()` sparingly

## Tooling
- Linter: ESLint with `@typescript-eslint/recommended` + `eslint-plugin-nestjs`
- Formatter: Prettier
- Type checker: TypeScript with `strict: true`
