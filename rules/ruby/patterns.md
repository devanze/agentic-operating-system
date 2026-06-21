# Ruby Patterns

## Core Patterns

### Service Object Pattern
```ruby
# app/services/create_user.rb
class CreateUser
  Result = Struct.new(:success?, :user, :errors, keyword_init: true)

  def initialize(params)
    @params = params
  end

  def call
    user = User.new(@params)
    if user.save
      send_welcome_email(user)
      Result.new(success?: true, user: user)
    else
      Result.new(success?: false, errors: user.errors.full_messages)
    end
  end

  private

  def send_welcome_email(user)
    UserMailer.welcome(user).deliver_later
  end
end

# Usage
result = CreateUser.new(email: 'test@test.com', name: 'Alice').call
if result.success?
  # handle success
else
  # handle errors
end
```

### Presenter / Decorator Pattern
```ruby
class UserPresenter < SimpleDelegator
  def formatted_name
    "#{first_name} #{last_name}".strip
  end

  def status_badge
    active? ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  end

  def member_since
    "Member since #{created_at.strftime('%B %Y')}"
  end
end

# In controller
def show
  @user = UserPresenter.new(User.find(params[:id]))
end
```

### Concerns (Rails) for Shared Behavior
```ruby
module Archivable
  extend ActiveSupport::Concern

  included do
    scope :active, -> { where(archived_at: nil) }
    scope :archived, -> { where.not(archived_at: nil) }
  end

  def archive!
    update!(archived_at: Time.current)
  end

  def unarchive!
    update!(archived_at: nil)
  end

  def archived?
    archived_at.present?
  end
end

class Post < ApplicationRecord
  include Archivable
end
```

## Architecture
- Rails MVC: `app/models/`, `app/controllers/`, `app/views/`
- Service objects: `app/services/` for business operations
- Presenters: `app/presenters/` for view logic
- Policies: `app/policies/` for authorization (via Pundit)

## Common Idioms
- `tap` for object initialization: `User.new.tap { |u| u.email = params[:email] }`
- `presence` helper: `params[:name].presence || 'Guest'`
- `with_options` for DRY: `with_options dependent: :destroy do |o| o.has_many :orders end`
- `pluck` over `map` for single columns: `User.active.pluck(:email)`

## Anti-Patterns
- Fat models > 200 lines — extract to concerns or services
- Callbacks for cross-model logic — use service objects
- `rescue Exception` — rescue specific exceptions
- Overriding `method_missing` — prefer `delegate` or `SimpleDelegator`
