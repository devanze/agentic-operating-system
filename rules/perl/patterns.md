# Perl Patterns

## Core Patterns

### Moose/Moo Object-Oriented
```perl
package MyApp::User 1.00;
use Moo;
use Types::Standard qw(Str Int Bool);

has id        => (is => 'ro', isa => Int, required => 1);
has email     => (is => 'ro', isa => Str, required => 1);
has name      => (is => 'ro', isa => Str, predicate => 1);
has is_active => (is => 'rw', isa => Bool, default => 1);

sub full_name ($self) {
    return $self->name || "User #${\$self->id}";
}

sub deactivate ($self) {
    $self->is_active(0);
}

1;
```

### DBIx::Class (ORM) Pattern
```perl
package MyApp::Schema::Result::User;
use parent 'DBIx::Class::Core';

__PACKAGE__->table('users');
__PACKAGE__->add_columns(
    id      => { data_type => 'integer', is_auto_increment => 1 },
    email   => { data_type => 'varchar', size => 255 },
    name    => { data_type => 'varchar', size => 100, is_nullable => 1 },
    status  => { data_type => 'varchar', default_value => 'active' },
);
__PACKAGE__->set_primary_key('id');
__PACKAGE__->has_many(orders => 'MyApp::Schema::Result::Order', 'user_id');

sub active_orders ($self) {
    return $self->search_related('orders', { status => 'active' });
}

1;
```

### Try::Tiny for Error Handling
```perl
use Try::Tiny;

sub create_user ($email, $password) {
    my $result = try {
        validate_email($email);
        my $user = MyApp::Schema::Result::User->new(
            email    => $email,
            password => hash_password($password),
        );
        $user->insert;
        return { success => 1, user => $user };
    }
    catch {
        my $error = $_;
        if ($error =~ /duplicate/) {
            return { success => 0, error => 'Email already taken' };
        }
        die $_; # re-throw unknown errors
    };
    return $result;
}
```

## Architecture
- Module-based: `lib/MyApp/User.pm`, `lib/MyApp/Order.pm`
- MVC with Catalyst/Mojolicious: `Controller/`, `Model/`, `View/`
- Plack/PSGI middleware for cross-cutting concerns
- Template Toolkit (TT) for view rendering

## Common Idioms
- `open my $fh, '<:encoding(UTF-8)', $file or die "Cannot open $file: $!"`
- `map` and `grep` for list transformation: `my @names = map { $_->name } @users`
- `//` (defined-or) operator: `my $name = $user->name // 'Unknown'`
- `List::Util` for reduce, any, all: `use List::Util qw(any);`

## Anti-Patterns
- `$_` manipulation inside `map`/`grep` — use named variables
- Bareword filehandles — use lexical filehandles
- `use vars` — use `our` instead
- Prototypes except for constant subroutines
