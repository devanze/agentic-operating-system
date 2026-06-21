# Flutter Coding Style

## Naming
- Widgets: `PascalCase` (e.g., `UserProfileCard`, `LoginForm`)
- Files: `snake_case` matching widget (e.g., `user_profile_card.dart`)
- Variables: `camelCase` (e.g., `userName`, `isLoading`)
- Constants: `camelCase` with `k` prefix (e.g., `kCardPadding`, `kApiBaseUrl`)
- Private members: `_` prefix (e.g., `_loadData()`, `_counter`)

## Formatting
- 2-space indentation (Dart default)
- Opening brace on same line
- Semicolons required
- Max 80 characters per line
- Use `dart format` with Flutter's `analysis_options.yaml`

## Language-Specific Rules
- Use `const` constructors everywhere possible:
```dart
class UserAvatar extends StatelessWidget {
  const UserAvatar({
    super.key,
    required this.imageUrl,
    this.size = 48,
  });

  final String imageUrl;
  final double size;

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      radius: size / 2,
      backgroundImage: NetworkImage(imageUrl),
    );
  }
}
```
- Prefer `Widget` composition over helper methods:
```dart
// BAD — helper method
Widget _buildHeader(String title) {
  return Padding(
    padding: EdgeInsets.all(16),
    child: Text(title, style: TextStyle(fontSize: 20)),
  );
}

// GOOD — extracted Widget class
class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.title});
  final String title;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.all(16),
    child: Text(title, style: Theme.of(context).textTheme.headlineSmall),
  );
}
```
- Use `MediaQuery` and `LayoutBuilder` for responsive layouts:
```dart
@override
Widget build(BuildContext context) {
  final isWide = MediaQuery.of(context).size.width > 600;
  return isWide ? const WideLayout() : const NarrowLayout();
}
```

## Anti-Patterns
- Using `BuildContext` across async gaps — check `mounted` before using
- Over-nesting widgets past 5 levels — extract into widgets
- Hardcoding colors/sizes — use `Theme.of(context)` and constants
- Using `setState()` in `initState()` — use `WidgetsBinding.instance.addPostFrameCallback()`

## Tooling
- Linter: `flutter analyze` with strict `analysis_options.yaml` (include `package:flutter_lints/flutter.yaml`)
- Formatter: `dart format` or `flutter format`
- Type checker: Dart analyzer with `strict-casts: true`, `strict-raw-types: true`
