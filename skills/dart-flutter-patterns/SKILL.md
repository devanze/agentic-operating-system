---
name: dart-flutter-patterns
description: Dart and Flutter patterns covering null safety, async, widget composition, state management, and navigation. Use when building Flutter apps.
---

# Dart & Flutter Patterns

## Dart Null Safety
- `String?` for nullable types
- `?.` safe access, `??` default value
- `late` for lazy initialization
- `required` for mandatory named parameters

## Widget Architecture
```dart
// Compose, don't inherit
class MyButton extends StatelessWidget {
  const MyButton({super.key, required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {},
      child: Text(label),
    );
  }
}
```

## State Management
- **setState** — simple local state
- **Riverpod** — compile-safe, testable
- **Bloc** — event-driven, enterprise
- **Provider** — inherited widget wrapper

## Async
```dart
FutureBuilder<String>(
  future: fetchData(),
  builder: (context, snapshot) {
    if (snapshot.hasError) return ErrorWidget(snapshot.error!);
    if (snapshot.hasData) return Text(snapshot.data!);
    return const CircularProgressIndicator();
  },
)
```

## Navigation
- `Navigator.push` / `Navigator.pop`
- Named routes with `onGenerateRoute`
- GoRouter for declarative routing
- Deep link support
