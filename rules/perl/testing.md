# Perl Testing

## Framework
- Primary: `Test::More` (built-in, standard with Perl)
- Extended: `Test::Deep` (nested data matching), `Test::Exception` (exception tests)
- Mocking: `Test::MockModule` or `Test::MockObject`
- Coverage: `Devel::Cover`

## Conventions
- Test files: `*.t` in `t/` directory (e.g., `t/user_service.t`)
- Test plan: `use Test::More tests => N` or `use Test::More 'no_plan'`
- Use `done_testing()` for flexible test counts
- Module test files: `t/lib/MyApp/Test/` for test helpers

## Patterns

### Unit Testing with Test::More
```perl
use strict;
use warnings;
use Test::More tests => 8;
use Test::Deep;
use Test::Exception;
use FindBin;
use lib "$FindBin::Bin/../lib";
use MyApp::UserService;

# Fixture setup
my $service = MyApp::UserService->new;

# Test: user creation
subtest 'create_user' => sub {
    plan tests => 2;

    my $result = $service->create_user(
        email    => 'alice@test.com',
        password => 'Strong1!',
        name     => 'Alice',
    );

    ok($result->{success}, 'User created successfully');
    is($result->{user}->email, 'alice@test.com', 'Email matches');
};

# Test: duplicate email
subtest 'duplicate email' => sub {
    plan tests => 2;

    $service->create_user(email => 'dup@test.com', password => 'pass1');
    my $result = $service->create_user(
        email    => 'dup@test.com',
        password => 'pass2',
    );

    ok(!$result->{success}, 'Duplicate email fails');
    like($result->{error}, qr/taken/, 'Error message mentions taken');
};

# Test: find by ID
{
    my $user = $service->create_user(
        email    => 'bob@test.com',
        password => 'Pass123!',
    )->{user};

    my $found = $service->find_by_id($user->id);
    cmp_deeply($found, $user, 'find_by_id returns matching user');
}

# Test: exception handling
dies_ok {
    $service->create_user(email => '', password => '');
} 'Empty email and password throws exception';
```

### Mocking External Dependencies
```perl
use Test::MockModule;

my $mock_db = Test::MockModule->new('MyApp::Database');
$mock_db->mock('query', sub {
    my ($self, $sql, @params) = @_;
    # Return test data
    return [
        { id => 1, email => 'test@test.com', name => 'Test' },
    ];
});

my $result = $service->find_all();
is(scalar @$result, 1, 'find_all returns mocked data');
```

### Test::Deep for Complex Structures
```perl
use Test::Deep;

my $response = $api->get_user(1);

cmp_deeply(
    $response,
    {
        id      => 1,
        email   => re(qr/\@test\.com$/),
        created => re(qr/^\d{4}-\d{2}-\d{2}/),
        name    => ignore(), # don't care about name
    },
    'API response structure is valid',
);
```

## Coverage
- Target: 90%+ for business logic modules, 80%+ overall
- Tool: `Devel::Cover` — `cover -test -report html t/*.t`
- CI: `HARNESS_PERL_SWITCHES=-MDevel::Cover prove -lv t/`
- Focus: business logic, edge cases, error paths, database queries
