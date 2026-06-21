# Swift Coding Style

## Naming
- Types (structs, classes, enums, protocols): `PascalCase` (e.g., `UserService`, `OrderItem`)
- Functions/methods: `camelCase` (e.g., `getUserById()`, `formatCurrency()`)
- Variables/properties: `camelCase` (e.g., `userName`, `isLoading`)
- Constants: `camelCase` (Swift convention) or `kPrefix` (e.g., `defaultTimeout`, `kMaxRetries`)
- Protocols: `PascalCase`, often with `-able`/`-ible` suffix or noun-based (e.g., `Codable`, `Respoable`)
- Enum cases: `lowerCamelCase` (e.g., `.pending`, `.shipped`)

## Formatting
- 4-space indentation (Xcode default)
- Opening brace on same line
- No trailing semicolons
- Max 100 characters per line
- Explicit self when accessing properties (required in closures)

## Language-Specific Rules
- Use value types (`struct`) by default, reference types (`class`) sparingly:
```swift
struct User: Identifiable, Codable {
    let id: Int
    let email: String
    var name: String?
    let createdAt: Date
}
```
- Use Swift Concurrency (`async/await`) over completion handlers:
```swift
// BAD — completion handler
func fetchUser(id: Int, completion: @escaping (Result<User, Error>) -> Void) {
    URLSession.shared.dataTask(with: url) { data, _, error in
        if let data = data { completion(.success(parse(data))) }
        else { completion(.failure(error!)) }
    }.resume()
}

// GOOD — async/await
func fetchUser(id: Int) async throws -> User {
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(User.self, from: data)
}
```
- Use `guard` for early returns and optional binding:
```swift
func processOrder(_ order: Order?) -> String {
    guard let order = order else { return "No order" }
    guard order.isPaid else { return "Order not paid" }
    return "Order #\(order.id) confirmed"
}
```

## Anti-Patterns
- Force unwrapping (`!`) on optionals — use `guard let` or `if let`
- Large classes — prefer structs and protocol composition
- Using `self` unnecessarily (required only in closures or for disambiguation)
- Implicitly unwrapped optionals in public API — use proper optionals

## Tooling
- Linter: SwiftLint with project `.swiftlint.yml`
- Formatter: swift-format (official) or SwiftFormat (community)
- Analyzer: Xcode Analyze (Clang Static Analyzer)
