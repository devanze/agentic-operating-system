# Perl Coding Style

## Naming
- Packages/Classes: `PascalCase` (e.g., `MyApp::UserService`, `MyApp::Order`)
- Functions/methods: `snake_case` (e.g., `get_user_by_id`, `calculate_total`)
- Lexical variables: `snake_case` (e.g., `my $user_name`, `my @order_items`)
- Global variables: capitalized (e.g., `$Config`, `@ARGV`)
- File handles: uppercase (e.g., `open my $FH, '<', 'file.txt'`)
- Constants: uppercase via `Readonly` or `constant` pragma

## Formatting
- 4-space indentation (standard Perl community style)
- Opening brace on same line for subroutines
- Use consistent spacing around operators
- Max 80-100 characters per line
- Use `use strict;` and `use warnings;` in every file

## Language-Specific Rules
- Always use `strict` and `warnings` — never skip them:
```perl
use strict;
use warnings;
use feature 'say';
use feature 'signatures';
no warnings 'experimental::signatures';
```
- Use signatures (Perl 5.20+) for named parameters:
```perl
# BAD
sub create_user {
    my ($email, $password, $name) = @_;
    # ...
}

# GOOD — signatures
use feature 'signatures';
sub create_user ($email, $password, $name = undef) {
    # ...
}
```
- Use `Path::Tiny` over raw file operations:
```perl
use Path::Tiny;
my $content = path('file.txt')->slurp_utf8;
path('output.txt')->spew_utf8($content);
```

## Anti-Patterns
- Using `@_` directly without unpacking — use signatures or `shift`/`my ($x) = @_`
- Global variables for configuration — use `Config::Any` or `Mojolicious` plugin
- Nested loops over 3 levels — extract into subroutines
- String eval (`eval "..."`) — use `try`/`catch` from `Try::Tiny` instead

## Tooling
- Linter: `Perl::Critic` with severity levels (run `perlcritic --brutal`)
- Formatter: `perltidy` with project `.perltidyrc`
- Analyzer: `B::Lint` or `Perl::Critic` static analysis
- Style guide: `perlstyle` (built-in Perl documentation)
