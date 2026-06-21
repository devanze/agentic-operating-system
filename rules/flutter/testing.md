# Flutter Testing

## Framework
- Unit: `flutter_test` package (built-in) with `test()` and `expect()`
- Widget: `flutter_test` with `WidgetTester`, `pumpWidget()`, `find`
- Integration: `integration_test` package from Flutter SDK
- Mocking: `mocktail` (preferred) or `mockito`

## Conventions
- Unit tests: `*_test.dart` alongside source in `test/` directory
- Widget tests: co-located with widget source or in `test/widgets/`
- Integration tests: `integration_test/` at project root
- Mirror `lib/` structure under `test/`

## Patterns

### Widget Testing with WidgetTester
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

void main() {
  testWidgets('UserCard displays user name and email', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: UserCard(user: User(id: 1, name: 'Alice', email: 'alice@test.com')),
        ),
      ),
    );

    expect(find.text('Alice'), findsOneWidget);
    expect(find.text('alice@test.com'), findsOneWidget);
    expect(find.byIcon(Icons.person), findsOneWidget);
  });

  testWidgets('tapping edit button calls onEdit callback', (tester) async {
    var tapped = false;
    await tester.pumpWidget(
      MaterialApp(
        home: UserCard(
          user: User(id: 1, name: 'Bob', email: 'bob@test.com'),
          onEdit: () => tapped = true,
        ),
      ),
    );

    await tester.tap(find.byIcon(Icons.edit));
    expect(tapped, isTrue);
  });
}
```

### BLoC Unit Testing
```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';

class MockUserRepo extends Mock implements UserRepository {}

void main() {
  late UserBloc userBloc;
  late MockUserRepo mockRepo;

  setUp(() {
    mockRepo = MockUserRepo();
    userBloc = UserBloc(mockRepo);
  });

  blocTest<UserBloc, UserState>(
    'emits [Loading, Loaded] when fetch succeeds',
    build: () {
      when(() => mockRepo.getById(1)).thenAnswer(
        (_) async => User(id: 1, name: 'Alice'),
      );
      return userBloc;
    },
    act: (bloc) => bloc.add(FetchUser(1)),
    expect: () => [
      UserLoading(),
      UserLoaded(User(id: 1, name: 'Alice')),
    ],
  );

  blocTest<UserBloc, UserState>(
    'emits [Loading, Error] when fetch fails',
    build: () {
      when(() => mockRepo.getById(1)).thenThrow(Exception('Network error'));
      return userBloc;
    },
    act: (bloc) => bloc.add(FetchUser(1)),
    expect: () => [
      UserLoading(),
      isA<UserError>(),
    ],
  );

  tearDown(() => userBloc.close());
}
```

### Integration Testing
```dart
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('full login flow', (tester) async {
    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('email_field')));
    await tester.enterText(find.byKey(const Key('email_field')), 'user@test.com');
    await tester.tap(find.byKey(const Key('password_field')));
    await tester.enterText(find.byKey(const Key('password_field')), 'password123');
    await tester.tap(find.byKey(const Key('login_button')));
    await tester.pumpAndSettle(const Duration(seconds: 5));

    expect(find.text('Dashboard'), findsOneWidget);
  });
}
```

## Coverage
- Target: 90%+ for BLoC classes and services, 80%+ for widgets
- Tool: `flutter test --coverage` + `genhtml` for HTML reports
- Command: `flutter test --coverage && genhtml coverage/lcov.info -o coverage/html`
- Focus: BLoC state transitions, repository error handling, widget interactions
