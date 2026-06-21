# Dart Coding Style

## Naming
- Classes: `PascalCase` (e.g., `UserService`, `OrderController`)
- Types/enums: `PascalCase` (e.g., `ConnectionStatus`, `HttpMethod`)
- Variables/functions: `camelCase` (e.g., `userList`, `calculateTotal()`)
- Constants: `lowerCamelCase` prefixed with `k` (e.g., `kDefaultTimeout`, `kMaxRetries`)
- Files: `snake_case` (e.g., `user_service.dart`, `order_model.dart`)
- Private members: prefix with `_` (e.g., `_httpClient`, `_loadData()`)

## Formatting
- 2-space indentation (Dart default)
- Opening brace on same line
- No trailing semicolons? — Dart always uses semicolons
- Max 80 characters per line (Dart recommended)
- Use `dart format` (based on `dart_style` package)

## Language-Specific Rules
- Use null safety features properly:
```dart
// Nullable types
String? maybeName;

// Null-aware operators
final name = maybeName ?? 'Guest';
final length = maybeName?.length ?? 0;

// Late initialization
late final List<User> users = _loadUsers();
```
- Use `sealed class` for discriminated unions:
```dart
sealed class ApiResult<T> {
  factory ApiResult.success(T data) = Success;
  factory ApiResult.error(String message) = Error;
}

class Success<T> implements ApiResult<T> {
  final T data;
  const Success(this.data);
}

class Error<T> implements ApiResult<T> {
  final String message;
  const Error(this.message);
}
```
- Use extension methods to add functionality:
```dart
extension DateTimeFormatting on DateTime {
  String toFormattedDate() => '${year}-${month.toString().padLeft(2, '0')}';
  bool isToday() {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }
}
```

## Anti-Patterns
- Using `dynamic` instead of proper types
- Overusing `late` — prefer constructor initialization
- Cascading `..` operators beyond 3-4 chains
- Ignoring `Future` return values — always await or handle

## Tooling
- Linter: `dart analyze` with `analysis_options.yaml` (recommended rules: `all` or `lints/recommended`)
- Formatter: `dart format`
- Type checker: Dart analyzer with `strict-casts: true`, `strict-raw-types: true`
