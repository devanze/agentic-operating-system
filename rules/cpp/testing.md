# C++ Testing

## Framework
- Primary: GoogleTest (`gtest`) with `gmock` for mocking
- Alternatives: Catch2 (header-only, modern), doctest (lightweight)
- Build integration: CMake's `enable_testing()` + `add_test()`

## Conventions
- Test files: `*_test.cpp` suffix (e.g., `user_repository_test.cpp`)
- Test suites organized in `test/` directory mirroring source tree
- Each test file covers one class or module

## Patterns

### Unit Testing with GoogleTest
```cpp
#include <gtest/gtest.h>
#include <gmock/gmock.h>
#include "user_service.hpp"

using namespace testing;

class UserServiceTest : public Test {
protected:
    MockUserRepository mockRepo;
    PasswordEncoder encoder;
    UserService service{mockRepo, encoder};

    User sampleUser{1, "alice@test.com", "hash", "Alice"};
};

TEST_F(UserServiceTest, FindById_ExistingUser_ReturnsUser) {
    EXPECT_CALL(mockRepo, findById(1))
        .WillOnce(Return(sampleUser));

    auto result = service.findById(1);

    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->getName(), "Alice");
    EXPECT_EQ(result->getEmail(), "alice@test.com");
}

TEST_F(UserServiceTest, FindById_MissingUser_ReturnsNullopt) {
    EXPECT_CALL(mockRepo, findById(99))
        .WillOnce(Return(std::nullopt));

    auto result = service.findById(99);

    ASSERT_FALSE(result.has_value());
}
```

### Mocking with GoogleMock
```cpp
class MockUserRepository : public UserRepository {
public:
    MOCK_METHOD(std::optional<User>, findById, (int id), (override));
    MOCK_METHOD(bool, existsByEmail, (std::string_view email), (override));
    MOCK_METHOD(User, save, (const User& user), (override));
};

TEST(UserServiceTest, Create_DuplicateEmail_Throws) {
    MockUserRepository mockRepo;
    PasswordEncoder encoder;
    UserService service{mockRepo, encoder};

    EXPECT_CALL(mockRepo, existsByEmail("existing@test.com"))
        .WillOnce(Return(true));

    EXPECT_THROW(service.create("existing@test.com", "pass", "Test"),
                 std::invalid_argument);
}
```

### Integration Testing with Test Fixtures
```cpp
class DatabaseTest : public Test {
protected:
    sql::Database db{":memory:"};

    void SetUp() override {
        db.execute("CREATE TABLE users (id INT, email TEXT, name TEXT)");
        db.execute("INSERT INTO users VALUES (1, 'test@test.com', 'Test')");
    }

    void TearDown() override {
        db.execute("DROP TABLE IF EXISTS users");
    }
};
```

## Coverage
- Target: 90%+ for business logic, 80%+ overall
- Tool: `gcov`/`lcov` or `gcovr` with CMake
- CI: `cmake --build build --target coverage` or `ctest --output-on-failure`
- Focus: edge cases, boundary values, exception paths
