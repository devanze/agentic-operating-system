---
name: cpp-coding-standards
description: C++ coding standards covering RAII, smart pointers, rule of 5, const correctness, modern C++17/20 features, and memory safety. Use when writing or reviewing C++ code.
---

# C++ Coding Standards

## Memory Management
- RAII: resources tied to object lifetime
- `std::unique_ptr` for exclusive ownership
- `std::shared_ptr` for shared ownership (use sparingly)
- `std::make_unique` / `std::make_shared` for creation
- No raw `new`/`delete`

## Rule of 5/3/0
```cpp
class Resource {
public:
    Resource();                    // Constructor
    ~Resource();                   // Destructor
    Resource(const Resource&);     // Copy constructor
    Resource& operator=(const Resource&); // Copy assignment
    Resource(Resource&&) noexcept; // Move constructor
    Resource& operator=(Resource&&) noexcept; // Move assignment
};
// Rule of 0: if all members manage themselves, declare none
```

## Const Correctness
- `const` methods when they don't mutate
- `const` parameters for read-only references
- `const` iterators: `cbegin()`, `cend()`
- `constexpr` for compile-time evaluation

## Modern C++ Features
- `auto` when type is obvious from right side
- Range-based for: `for (const auto& item : container)`
- Structured bindings: `auto [key, value] = ...`
- `std::optional` over sentinel values
- `std::variant` for type-safe unions
- `std::string_view` for read-only string params
