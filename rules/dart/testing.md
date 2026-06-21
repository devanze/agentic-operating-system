# Dart Testing

## Framework
- Primary: `test` package (`test()`, `expect()`, `group()`)
- Mocking: `mocktail` (Dart-first mocking)
- Alternative: `mockito` with code generation (requires `build_runner`)

## Conventions
- Test files: `_test.dart` suffix (e.g., `user_service_test.dart`)
- Mirror `lib/` structure in `test/` directory
- Use `group()` for organizing related tests

## Patterns

### Unit Testing with mocktail
```dart
import 'package:mocktail/mocktail.dart';
import 'package:test/test.dart';

class MockUserApi extends Mock implements UserApi {}
class MockCache extends Mock implements Cache {}

void main() {
  late UserService service;
  late MockUserApi api;
  late MockCache cache;

  setUp(() {
    api = MockUserApi();
    cache = MockCache();
    service = UserService(api, cache);
  });

  group('getUserById', () {
    test('returns cached user when available', () async {
      final cachedUser = User(id: 1, name: 'Cached User');
      when(() => cache.get<User>(1)).thenReturn(cachedUser);

      final result = await service.getUserById(1);

      expect(result, equals(cachedUser));
      verify(() => cache.get<User>(1)).called(1);
      verifyNever(() => api.fetchUser(any()));
    });

    test('fetches and caches user when not cached', () async {
      when(() => cache.get<User>(1)).thenReturn(null);
      when(() => api.fetchUser(1)).thenAnswer((_) async =>
        User(id: 1, email: 'test@test.com', name: 'Alice'));

      final result = await service.getUserById(1);

      expect(result?.name, 'Alice');
      verify(() => cache.put(1, any())).called(1);
    });
  });

  group('createUser', () {
    test('throws on invalid email', () async {
      expect(
        () => service.createUser('invalid', 'Name'),
        throwsA(isA<ValidationException>()),
      );
    });
  });
}
```

### Stream/Async Testing
```dart
test('search emits debounced values', () async {
  final controller = StreamController<String>();
  final results = <List<String>>[];

  service.searchStream(controller.stream).listen(results.add);

  controller.add('a');
  await Future.delayed(Duration(milliseconds: 50));
  controller.add('al');
  await Future.delayed(Duration(milliseconds: 300)); // debounce

  expect(results.length, greaterThanOrEqualTo(1));
  await controller.close();
});
```

## Coverage
- Target: 90%+ for services, 80%+ for models and controllers
- Tool: `dart test --coverage=coverage` + `genhtml` for HTML reports
- Commands: `dart test --coverage=./coverage && genhtml coverage/lcov.info -o coverage/html`
- Focus: service business logic, model validation, error handling
