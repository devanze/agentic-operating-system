# C++ Patterns

## Core Patterns

### RAII (Resource Acquisition Is Initialization)
```cpp
class DatabaseConnection {
    sql::Connection* m_conn;
public:
    DatabaseConnection(const std::string& connStr) {
        m_conn = new sql::Connection(connStr);
        m_conn->connect();
    }
    ~DatabaseConnection() {
        if (m_conn) {
            m_conn->disconnect();
            delete m_conn;
        }
    }
    // Non-copyable
    DatabaseConnection(const DatabaseConnection&) = delete;
    DatabaseConnection& operator=(const DatabaseConnection&) = delete;
};
```

### CRTP (Curiously Recurring Template Pattern)
```cpp
template <typename Derived>
class Singleton {
public:
    static Derived& instance() {
        static Derived inst;
        return inst;
    }
    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;
protected:
    Singleton() = default;
};

class Logger : public Singleton<Logger> {
    friend class Singleton<Logger>;
public:
    void log(std::string_view msg) { /* ... */ }
};
```

### Smart Pointers for Ownership
```cpp
// Unique ownership
auto user = std::make_unique<User>("Alice");
user->setEmail("alice@test.com");

// Shared ownership (use sparingly)
auto config = std::make_shared<Config>();
auto& cfg = *config; // reference where possible

// Weak reference to break cycles
class Node {
    std::string m_name;
    std::weak_ptr<Node> m_parent;
    std::vector<std::shared_ptr<Node>> m_children;
};
```

## Architecture
- Header (.hpp) + implementation (.cpp) files for each class
- PImpl idiom for reducing compile-time dependencies
- Namespaces matching directory structure: `app::service::`, `app::model::`
- Abstract base classes for extensibility (virtual destructor)

## Common Idioms
- `auto` for type deduction when explicit type isn't helpful
- Range-based for: `for (const auto& [key, value] : map)`
- `std::optional` for possibly-missing values
- `std::variant` for type-safe unions and visitor pattern
- `std::string_view` for read-only string parameters

## Anti-Patterns
- Raw owning pointers — use smart pointers
- Virtual functions in hot code paths — prefer `std::variant` + `visit`
- Large stack allocations — use heap via containers
- Macros for type traits — use `constexpr` + templates
