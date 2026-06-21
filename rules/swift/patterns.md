# Swift Patterns

## Core Patterns

### MVVM with ObservableObject
```swift
import SwiftUI
import Combine

// Model
struct User: Identifiable, Codable {
    let id: Int
    let email: String
    let name: String
}

// ViewModel
@MainActor
class UserViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let service: UserService

    init(service: UserService = UserService()) {
        self.service = service
    }

    func loadUsers() async {
        isLoading = true
        errorMessage = nil
        do {
            users = try await service.fetchUsers()
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}

// View
struct UserListView: View {
    @StateObject private var viewModel = UserViewModel()

    var body: some View {
        List(viewModel.users) { user in
            Text(user.name)
        }
        .task { await viewModel.loadUsers() }
        .overlay {
            if viewModel.isLoading { ProgressView() }
        }
    }
}
```

### Protocol-Oriented Design
```swift
// Protocol defines the contract
protocol UserRepository {
    func fetchUser(id: Int) async throws -> User
    func saveUser(_ user: User) async throws
}

// Concrete implementation
actor RemoteUserRepository: UserRepository {
    private let baseURL = URL(string: "https://api.example.com")!

    func fetchUser(id: Int) async throws -> User {
        let url = baseURL.appendingPathComponent("users/\(id)")
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(User.self, from: data)
    }

    func saveUser(_ user: User) async throws {
        // implementation
    }
}
```

### Coordinator Pattern (Navigation)
```swift
@MainActor
final class AppCoordinator: ObservableObject {
    enum Route: Hashable {
        case login
        case home
        case userDetail(User)
        case settings
    }

    @Published var path = NavigationPath()

    func navigate(to route: Route) {
        path.append(route)
    }

    func goBack() {
        path.removeLast()
    }

    func popToRoot() {
        path.removeLast(path.count)
    }
}
```

## Architecture
- MVVM with SwiftUI: Model → ViewModel (ObservableObject) → View
- Combine or async/await for reactive data flow
- Repository pattern for data access abstracting network vs cache
- Coordinator for navigation logic

## Common Idioms
- `Codable` conformance for JSON serialization
- `@escaping` closures for async before Swift Concurrency adoption
- `@State` for local view state, `@StateObject` for owned VM, `@ObservedObject` for passed VMs
- `@EnvironmentObject` for dependency injection through view hierarchy
- `@MainActor` for UI-bound operations

## Anti-Patterns
- Massive View Controllers (in UIKit) — split into ViewModel + extensions
- Singletons for services — prefer protocol-based DI with environment injection
- Over-engineering with complex generics prematurely
- Retain cycles from closure capture — use `[weak self]` appropriately
