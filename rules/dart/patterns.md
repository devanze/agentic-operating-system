# Dart Patterns

## Core Patterns

### Factory Constructors
```dart
class User {
  final int id;
  final String email;
  final String name;

  const User({required this.id, required this.email, required this.name});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      email: json['email'] as String,
      name: json['name'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'name': name,
  };
}
```

### Mixins for Code Reuse
```dart
mixin Logging {
  void log(String message) {
    final timestamp = DateTime.now().toIso8601String();
    print('[$timestamp] $message');
  }
}

mixin Validatable {
  bool isValidEmail(String email) => RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]+$').hasMatch(email);
}

class UserService with Logging, Validatable {
  User? create(String email, String name) {
    if (!isValidEmail(email)) {
      log('Invalid email: $email');
      return null;
    }
    log('Creating user: $name');
    return User(1, email, name);
  }
}
```

### Isolates for Parallelism
```dart
Future<List<User>> parseUsersInBackground(String jsonString) async {
  return Isolate.run(() {
    final list = jsonDecode(jsonString) as List;
    return list.map((e) => User.fromJson(e as Map<String, dynamic>)).toList();
  });
}

// Usage
void main() async {
  final json = await http.get(Uri.parse('https://api.example.com/users'));
  final users = await parseUsersInBackground(json.body);
}
```

## Architecture
- Repository pattern for data access abstraction
- Service layer for business logic
- Provider/Riverpod for state management across widgets
- Clean Architecture: `data/` (DTOs, repositories), `domain/` (entities, services), `presentation/` (widgets)

## Common Idioms
- Cascade notation `..` for object configuration: `ListBuilder()..add('a')..add('b')`
- `copyWith` pattern for immutable data classes:
```dart
User copyWith({int? id, String? email, String? name}) {
  return User(id: id ?? this.id, email: email ?? this.email, name: name ?? this.name);
}
```

## Anti-Patterns
- Using `print()` for logging in production — use `logging` package
- Deep widget trees without extracting to `Widget` methods
- Async constructors — use factory + `Future` instead
- Mutable state in service classes — prefer immutable models
