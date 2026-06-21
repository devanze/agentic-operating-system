# Ruby Testing

## Framework
- Primary: RSpec (`rspec-rails` for Rails projects)
- Alternative: Minitest (Rails default, simpler)
- Factories: FactoryBot (replaces fixtures)
- Browser testing: Capybara with Selenium or Cuprite

## Conventions
- Test files: `*_spec.rb` for RSpec, `*_test.rb` for Minitest
- Directory: `spec/` mirroring `app/` structure (e.g., `spec/models/`, `spec/services/`)
- Use `let` and `let!` for memoized variables
- Use `subject` to define the object under test

## Patterns

### RSpec Model Testing
```ruby
require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    subject { build(:user) }

    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to validate_presence_of(:password).on(:create) }
    it { is_expected.to allow_value('test@test.com').for(:email) }
    it { is_expected.not_to allow_value('invalid').for(:email) }
  end

  describe '#active?' do
    it 'returns true when user has not been archived' do
      user = build(:user, archived_at: nil)
      expect(user).to be_active
    end

    it 'returns false when user has been archived' do
      user = build(:user, archived_at: Time.current)
      expect(user).not_to be_active
    end
  end
end
```

### RSpec Service Testing
```ruby
RSpec.describe CreateUser, type: :service do
  describe '#call' do
    let(:params) { { email: 'new@test.com', password: 'Pass123!', name: 'Alice' } }

    context 'with valid params' do
      it 'creates a new user' do
        expect { subject.call }.to change(User, :count).by(1)
      end

      it 'returns a successful result' do
        result = described_class.new(params).call
        expect(result).to be_success
        expect(result.user).to be_persisted
      end

      it 'sends a welcome email' do
        expect { described_class.new(params).call }
          .to have_enqueued_mail(UserMailer, :welcome)
      end
    end

    context 'with invalid params' do
      let(:params) { { email: '', password: 'short', name: '' } }

      it 'does not create a user' do
        expect { described_class.new(params).call }
          .not_to change(User, :count)
      end

      it 'returns errors' do
        result = described_class.new(params).call
        expect(result).not_to be_success
        expect(result.errors).to include("Email can't be blank")
      end
    end
  end
end
```

### Request / Integration Spec
```ruby
RSpec.describe 'Users API', type: :request do
  describe 'POST /api/v1/users' do
    let(:valid_params) do
      { user: { email: 'test@test.com', password: 'Strong1!', name: 'Bob' } }
    end

    it 'creates a new user and returns 201' do
      post '/api/v1/users', params: valid_params, as: :json

      expect(response).to have_http_status(:created)
      json = response.parsed_body
      expect(json['email']).to eq('test@test.com')
    end

    it 'returns 422 with invalid params' do
      post '/api/v1/users', params: { user: { email: '' } }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
```

## Coverage
- Target: 90%+ for models and services, 80%+ for controllers
- Tool: `simplecov` with `SimpleCov.minimum_coverage 90`
- CI: `bundle exec rspec && open coverage/index.html`
- Focus: model validations, service logic, authorization checks, edge cases
