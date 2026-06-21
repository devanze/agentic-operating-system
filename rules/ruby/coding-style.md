# Ruby Coding Style

## Naming
- Classes/modules: `PascalCase` (e.g., `UserService`, `OrderController`)
- Methods: `snake_case` (e.g., `find_by_email`, `calculate_total`)
- Variables: `snake_case` (e.g., `user_name`, `is_active`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`, `API_BASE_URL`)
- Files/directories: `snake_case` matching class (e.g., `user_service.rb`)
- Predicate methods: suffix with `?` (e.g., `user.active?`, `order.paid?`)

## Formatting
- 2-space indentation (Ruby standard)
- No tabs
- No trailing whitespace
- Max 80 characters per line (100 for Rails)
- Freezing string literals: `# frozen_string_literal: true` at top of files
- Use `do...end` for multi-line blocks, `{ }` for single-line

## Language-Specific Rules
- Use safe navigation operator instead of `try`:
```ruby
# BAD
user.try(:address).try(:city)

# GOOD
user&.address&.city
```
- Use `dig` for safe hash/array access:
```ruby
# BAD
params[:user][:address][:city] rescue nil

# GOOD
params.dig(:user, :address, :city)
```
- Prefer `each` over `for` loops, use `map`/`select`/`reduce` for transformations:
```ruby
# BAD
result = []
users.each { |u| result << u.name if u.active? }

# GOOD
active_names = users.select(&:active?).map(&:name)
```
- Use `&.` and `||` for default values:
```ruby
def find_user(id)
  User.find_by(id: id) || GuestUser.new
end
```

## Anti-Patterns
- Using `unless` with `else` — confusing, use `if` instead
- `return` at end of method — Ruby returns last expression
- Long methods (> 15 lines) — extract into smaller methods
- String interpolation in SQL — use parameterized queries

## Tooling
- Linter: RuboCop with `rubocop-rails` or `rubocop-rspec` extensions
- Formatter: `rubocop -A` (auto-correct) or `standardrb`
- Type checker: Sorbet (gradual type system) or RBS (Ruby 3+)
