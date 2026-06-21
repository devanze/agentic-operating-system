---
name: csharp-testing
description: C# testing patterns with xUnit/NUnit, Moq, FluentAssertions, integration tests with TestContainers, and test organization. Use when writing C# tests.
---

# C# Testing Patterns

## Test Frameworks
- **xUnit** (preferred) — `[Fact]`, `[Theory]`, `[InlineData]`
- **NUnit** — `[Test]`, `[TestCase]`, `[TestCaseSource]`
- Use `ITestOutputHelper` for test logging in xUnit

## Moq (Mocking)
```csharp
var mockRepo = new Mock<IUserRepository>();
mockRepo.Setup(r => r.GetById(It.IsAny<int>()))
        .ReturnsAsync(new User { Id = 1 });

// Verify calls
mockRepo.Verify(r => r.Save(It.IsAny<User>()), Times.Once);
```

## FluentAssertions
```csharp
result.Should().NotBeNull();
result.Name.Should().Be("Test");
result.Items.Should().HaveCount(3);
action.Should().Throw<ValidationException>()
      .WithMessage("Invalid input");
```

## Test Organization
- Test project mirrors source project structure
- Arrange-Act-Assert pattern
- Test method names: `Method_Scenario_ExpectedResult`
- Use test fixtures for shared setup
