# C++ Coding Style

## Naming
- Classes: `PascalCase` (e.g., `UserRepository`, `HttpClient`)
- Member functions: `camelCase` (e.g., `getUserById()`, `calculateTotal()`)
- Member variables: `m_camelCase` prefix (e.g., `m_userId`, `m_name`)
- Constants: `UPPER_SNAKE_CASE` or `kCamelCase` (e.g., `MAX_BUFFER_SIZE`, `kDefaultTimeout`)
- Macros: `UPPER_SNAKE_CASE` (avoid macros when possible)
- Namespaces: `snake_case` (e.g., `core::net`, `app::models`)

## Formatting
- 4-space indentation (no tabs)
- Opening braces on same line for functions, new line for classes
- Pointer/reference: `int* ptr` (asterisk by type)
- Max 100 characters per line
- Use `clang-format` with LLVM or Google style

## Language-Specific Rules
- Follow the Rule of 5 (or Rule of 0):
```cpp
class Resource {
public:
    Resource() = default;
    ~Resource();
    Resource(const Resource&);            // copy ctor
    Resource& operator=(const Resource&); // copy assignment
    Resource(Resource&&) noexcept;        // move ctor
    Resource& operator=(Resource&&) noexcept; // move assignment
};
```
- Prefer `constexpr` over macro constants:
```cpp
constexpr int MAX_RETRIES = 3;
constexpr double PI = 3.14159;
```
- Use RAII for resource management:
```cpp
class FileHandler {
    std::ifstream m_file;
public:
    explicit FileHandler(const std::string& path) : m_file(path) {
        if (!m_file.is_open()) throw std::runtime_error("Failed to open file");
    }
    // Destructor automatically closes file
};
```

## Anti-Patterns
- Raw `new`/`delete` — always use `std::unique_ptr` or `std::make_shared`
- C-style casts — use `static_cast`, `dynamic_cast`, `reinterpret_cast`
- Using `#define` for constants — use `constexpr` or `inline constexpr`
- Manual memory management in containers — use `std::vector`, `std::string`

## Tooling
- Linter: `clang-tidy` with modern checks
- Formatter: `clang-format` with project `.clang-format`
- Type checker: `clang` with `-Wall -Wextra -Wpedantic -Werror`
