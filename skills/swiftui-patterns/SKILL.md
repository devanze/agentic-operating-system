---
name: swiftui-patterns
description: SwiftUI patterns covering View composition, state management, navigation, async/await integration, and accessibility. Use when building or reviewing SwiftUI code.
---

# SwiftUI Patterns

## View Composition
- Small, focused views composed together
- Use `@ViewBuilder` for conditional content
- Extract reusable components, not helper functions

## State Management
```swift
@State       // Local view state
@Binding     // Two-way connection to parent
@StateObject // View owns the ObservableObject
@ObservedObject // View receives ObservableObject
@EnvironmentObject // Injected from environment
@Environment // System values (colorScheme, etc.)
```

## Data Flow
- Single source of truth
- State flows down, actions flow up
- ObservableObject for complex state
- @MainActor for published properties

## Navigation
- NavigationStack (iOS 16+) for push/pop
- NavigationLink for simple navigation
- NavigationPath for programmatic navigation
- TabView for tab-based navigation

## Async/Await
```swift
.task { await loadData() }
.refreshable { await refresh() }

// Task management
@State private var task: Task<Void, Never>?
// Cancel on disappear
.onDisappear { task?.cancel() }
```
