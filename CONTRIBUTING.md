# Contributing to DealChain

First off, thank you for considering contributing to DealChain! It's people like you that make DealChain such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible using our [bug report template](.github/ISSUE_TEMPLATE/bug_report.yml).

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.yml).

### Pull Requests

1. Fork the repo and create your branch from `develop`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

### 1. Setup Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/dealchain.git
cd dealchain

# Add upstream remote
git remote add upstream https://github.com/dealchain/dealchain.git

# Install dependencies
pnpm install

# Setup pre-commit hooks
pnpm prepare
```

### 2. Create a Branch

```bash
# Always branch from develop
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

**Branch Naming Convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation only
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 3. Make Your Changes

#### For Smart Contract Changes:

```bash
cd packages/anchor

# Make your changes to lib.rs

# Run tests
anchor test

# Check formatting
cargo fmt -- --check

# Run clippy
cargo clippy -- -D warnings
```

#### For Frontend Changes:

```bash
cd apps/web

# Make your changes

# Run linter
pnpm lint

# Run type check
pnpm type-check

# Run tests
pnpm test

# Build to ensure no errors
pnpm build
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <subject>

git commit -m "feat(marketplace): add filter by category"
git commit -m "fix(contract): prevent duplicate redemption"
git commit -m "docs(readme): update installation instructions"
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub using our [PR template](.github/PULL_REQUEST_TEMPLATE.md).

## Coding Standards

### TypeScript/JavaScript

```typescript
// ✅ Good
export function calculateDiscount(price: number, percent: number): number {
  return price * (percent / 100);
}

// ❌ Bad
export function calc(p, pc) {
  return p * (pc / 100);
}
```

**Rules:**
- Use TypeScript strict mode
- Prefer `const` over `let`
- Use descriptive variable names
- Add JSDoc comments for public APIs
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

### Rust (Smart Contracts)

```rust
// ✅ Good
pub fn purchase_coupon(ctx: Context<PurchaseCoupon>) -> Result<()> {
    let coupon = &mut ctx.accounts.coupon;

    // CHECKS
    require!(coupon.is_active, ErrorCode::CouponInactive);

    // EFFECTS
    coupon.total_purchases += 1;

    // INTERACTIONS
    token::transfer(cpi_ctx, price)?;

    Ok(())
}

// ❌ Bad
pub fn purchase(c: Context<P>) -> Result<()> {
    c.accounts.c.t += 1;
    token::transfer(c, p)?;
    Ok(())
}
```

**Rules:**
- Follow [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- Use descriptive names
- Add doc comments (`///`)
- Follow Checks-Effects-Interactions pattern
- Use `checked_*` arithmetic operations

### React Components

```tsx
// ✅ Good
interface DealCardProps {
  deal: Deal;
  onPurchase: (dealId: string) => void;
}

export function DealCard({ deal, onPurchase }: DealCardProps) {
  const handleClick = () => onPurchase(deal.id);

  return (
    <Card>
      <CardTitle>{deal.title}</CardTitle>
      <Button onClick={handleClick}>Purchase</Button>
    </Card>
  );
}

// ❌ Bad
export function DC(props) {
  return <div onClick={() => props.onPurchase(props.deal.id)}>...</div>;
}
```

**Rules:**
- Use functional components with hooks
- Extract complex logic into custom hooks
- Use TypeScript interfaces for props
- Keep components focused and small
- Follow [React Best Practices](https://react.dev/learn)

## Testing Guidelines

### Unit Tests (Anchor)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_purchase_coupon_success() {
        // Arrange
        let mut coupon = create_test_coupon();

        // Act
        let result = purchase_coupon(&mut coupon);

        // Assert
        assert!(result.is_ok());
        assert_eq!(coupon.total_purchases, 1);
    }
}
```

### Unit Tests (Frontend)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { DealCard } from './DealCard';

describe('DealCard', () => {
  it('calls onPurchase when button clicked', () => {
    const mockOnPurchase = jest.fn();
    const deal = { id: '1', title: 'Test Deal' };

    render(<DealCard deal={deal} onPurchase={mockOnPurchase} />);

    fireEvent.click(screen.getByText('Purchase'));

    expect(mockOnPurchase).toHaveBeenCalledWith('1');
  });
});
```

### Test Coverage Requirements

- **Smart Contracts**: Minimum 90% coverage
- **Frontend**: Minimum 80% coverage
- **Critical paths**: 100% coverage

## Security

### Reporting Vulnerabilities

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, email: **security@dealchain.app**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours.

### Security Guidelines

- Never commit secrets (API keys, private keys, etc.)
- Use environment variables for configuration
- Validate all user inputs
- Follow principle of least privilege
- Use `checked_*` operations in Rust
- Implement CEI pattern in smart contracts

## Documentation

### Code Comments

```rust
/// Purchases a coupon NFT
///
/// # Arguments
/// * `ctx` - The context containing all required accounts
///
/// # Returns
/// * `Result<()>` - Ok if purchase succeeds, Error otherwise
///
/// # Errors
/// * `CouponInactive` - If the coupon is not active
/// * `CouponExpired` - If the coupon has expired
/// * `SoldOut` - If all coupons have been sold
pub fn purchase_coupon(ctx: Context<PurchaseCoupon>) -> Result<()> {
    // Implementation
}
```

### README Updates

When adding new features, update:
- `README.md` - Main project overview
- `docs/API.md` - API documentation
- `docs/INTEGRATION.md` - Integration guides

## Pull Request Process

1. **Self-Review**: Review your own PR before requesting reviews
2. **Tests**: Ensure all tests pass
3. **Documentation**: Update docs if needed
4. **Changelog**: Add entry to `CHANGELOG.md`
5. **Request Review**: Tag appropriate reviewers
6. **Address Feedback**: Respond to all review comments
7. **Squash Commits**: Clean up commit history if needed
8. **Merge**: Once approved, we'll merge your PR

### PR Review Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Security considerations addressed
- [ ] Performance impact assessed

## Getting Help

- **Discord**: Join our [Discord server](https://discord.gg/dealchain)
- **GitHub Discussions**: Ask questions in [Discussions](https://github.com/dealchain/dealchain/discussions)
- **Twitter**: Follow [@DealChainHQ](https://twitter.com/DealChainHQ)

## Recognition

Contributors will be:
- Listed in `CONTRIBUTORS.md`
- Mentioned in release notes
- Eligible for contributor NFT badges (coming soon!)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to DealChain! 🚀
