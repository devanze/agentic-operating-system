# Flutter Patterns

## Core Patterns

### BLoC Pattern (Business Logic Component)
```dart
// Event
sealed class UserEvent {}
class FetchUser extends UserEvent {
  final int userId;
  FetchUser(this.userId);
}

// State
sealed class UserState {}
class UserInitial extends UserState {}
class UserLoading extends UserState {}
class UserLoaded extends UserState {
  final User user;
  UserLoaded(this.user);
}
class UserError extends UserState {
  final String message;
  UserError(this.message);
}

// BLoC
class UserBloc extends Bloc<UserEvent, UserState> {
  final UserRepository repository;
  UserBloc(this.repository) : super(UserInitial()) {
    on<FetchUser>((event, emit) async {
      emit(UserLoading());
      try {
        final user = await repository.getById(event.userId);
        emit(UserLoaded(user));
      } catch (e) {
        emit(UserError(e.toString()));
      }
    });
  }
}
```

### Provider / Riverpod for Simpler State
```dart
// Riverpod provider
final userServiceProvider = Provider<UserService>((ref) => UserService());
final userListProvider = FutureProvider<List<User>>((ref) async {
  final service = ref.read(userServiceProvider);
  return service.getAll();
});

// Widget usage
class UserListWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usersAsync = ref.watch(userListProvider);
    return usersAsync.when(
      loading: () => const CircularProgressIndicator(),
      error: (err, _) => Text('Error: $err'),
      data: (users) => ListView.builder(
        itemCount: users.length,
        itemBuilder: (_, i) => Text(users[i].name),
      ),
    );
  }
}
```

### Repository Pattern with Data Sources
```dart
class UserRepository {
  final UserRemoteDataSource remoteDataSource;
  final UserLocalDataSource localDataSource;

  UserRepository({required this.remoteDataSource, required this.localDataSource});

  Future<List<User>> getUsers() async {
    try {
      final users = await remoteDataSource.fetchUsers();
      await localDataSource.cacheUsers(users);
      return users;
    } catch (e) {
      final cached = await localDataSource.getCachedUsers();
      if (cached.isNotEmpty) return cached;
      throw RepositoryException('No data available');
    }
  }
}
```

## Architecture
- Feature-first: `lib/features/auth/`, `lib/features/orders/`
- Each feature: `data/` (DTOs, repos), `domain/` (entities, use cases), `presentation/` (widgets, blocs)
- Core layer: `lib/core/` for theme, routing, constants, network, database
- Screens folder for page-level widgets, widgets folder for reusable

## Common Idioms
- `AsyncSnapshot` handling with `snapshot.connectionState` checks
- `navigatorKey` for global navigation from services
- `Theme.of(context).textTheme.*` for consistent typography
- `FutureBuilder` and `StreamBuilder` for async data binding

## Anti-Patterns
- Passing entire `BuildContext` down multiple widget layers
- Giant `build()` methods spanning > 100 lines
- Using `globalKey` when state management would work better
- Blocking the UI thread with heavy synchronous computation
