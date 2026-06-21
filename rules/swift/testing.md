# Swift Testing

## Framework
- Primary: XCTest (built-in with Xcode)
- Modern alternative: Swift Testing (`@Test`, `#expect`) — iOS 17+/macOS 14+
- Mocking: manual mocks via protocols, or Cuckoo/Sourcery for generated mocks
- UI Testing: XCUITest via `XCUIApplication`

## Conventions
- Test files: `XxxTests.swift` in `ProjectNameTests/` target
- Test methods: `func testXxx() throws` or `@Test func xxx()` (Swift Testing)
- Mirror source tree in test target
- `setUp()` / `tearDown()` for XCTest, `init()` for Swift Testing

## Patterns

### XCTest with Protocol Mocks
```swift
import XCTest
@testable import MyApp

// Mock repository
class MockUserRepository: UserRepository {
    var fetchUserResult: Result<User, Error>?

    func fetchUser(id: Int) async throws -> User {
        guard let result = fetchUserResult else {
            throw TestError.unexpectedCall
        }
        return try result.get()
    }
}

enum TestError: Error {
    case unexpectedCall
}

final class UserViewModelTests: XCTestCase {
    var viewModel: UserViewModel!
    var mockRepo: MockUserRepository!

    override func setUp() {
        super.setUp()
        mockRepo = MockUserRepository()
        viewModel = UserViewModel(repository: mockRepo)
    }

    func testLoadUsersSuccess() async {
        // Given
        let expected = User(id: 1, email: "alice@test.com", name: "Alice")
        mockRepo.fetchUserResult = .success(expected)

        // When
        await viewModel.loadUsers()

        // Then
        XCTAssertEqual(viewModel.users.first?.name, "Alice")
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.errorMessage)
    }

    func testLoadUsersFailure() async {
        // Given
        mockRepo.fetchUserResult = .failure(URLError(.notConnectedToInternet))

        // When
        await viewModel.loadUsers()

        // Then
        XCTAssertTrue(viewModel.users.isEmpty)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNotNil(viewModel.errorMessage)
    }
}
```

### Swift Testing (iOS 17+)
```swift
import Testing

struct UserServiceTests {
    let service: UserService
    let mockRepo: MockUserRepository

    init() {
        mockRepo = MockUserRepository()
        service = UserService(repository: mockRepo)
    }

    @Test("Creates user with valid data")
    func createUserSuccess() async throws {
        mockRepo.saveUserResult = .success(())

        let user = try await service.createUser(
            email: "new@test.com",
            password: "Strong1!"
        )

        #expect(user.email == "new@test.com")
    }

    @Test("Throws on invalid email")
    func createUserInvalidEmail() async {
        await #expect(throws: ValidationError.self) {
            try await service.createUser(email: "bad", password: "pass")
        }
    }
}
```

### UI Testing with XCUITest
```swift
final class LoginFlowUITests: XCTestCase {
    let app = XCUIApplication()

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app.launch()
    }

    func testSuccessfulLogin() {
        let emailField = app.textFields["email"]
        emailField.tap()
        emailField.typeText("user@test.com")

        let passwordField = app.secureTextFields["password"]
        passwordField.tap()
        passwordField.typeText("password123")

        app.buttons["Login"].tap()

        let dashboard = app.staticTexts["Dashboard"]
        XCTAssertTrue(dashboard.waitForExistence(timeout: 5))
    }
}
```

## Coverage
- Target: 90%+ for ViewModels and services, 80%+ for models
- Tool: Xcode built-in coverage (Edit Scheme → Test → Code Coverage)
- CI: `xcodebuild test -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 15'`
- Focus: ViewModel state transitions, network layer error handling, model serialization
