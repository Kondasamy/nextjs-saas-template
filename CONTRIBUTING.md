# Contributing to Enterprise SaaS Template

Thank you for your interest in contributing! We welcome contributions from the community and are grateful for any help you can provide.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing. We are committed to fostering a welcoming and inclusive community.

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (Supabase recommended)
- Git

### Setting Up Development Environment

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/Kondasamy/nextjs-saas-template.git
   cd saas-template
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database:**
   ```bash
   pnpm db:generate
   pnpm db:push  # For development
   ```

5. **Start the development server:**
   ```bash
   pnpm dev
   ```

## Development Process

### Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch (optional)
- Feature branches - `feature/your-feature-name`
- Bug fixes - `fix/bug-description`
- Documentation - `docs/what-you-are-documenting`

### Workflow

1. Create a new branch from `main`
2. Make your changes
3. Write/update tests if applicable
4. Update documentation if needed
5. Submit a pull request

## How to Contribute

### Types of Contributions

#### 🐛 Bug Reports
- Use the issue template
- Include reproduction steps
- Provide environment details
- Add error messages/screenshots

#### ✨ Feature Requests
- Check existing issues first
- Provide use case and context
- Explain the expected behavior
- Consider implementation approach

#### 📝 Documentation
- Fix typos and clarifications
- Add examples and guides
- Improve code comments
- Translate documentation

#### 💻 Code Contributions
- Bug fixes
- New features
- Performance improvements
- Refactoring

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing code style (enforced by Biome)
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### React/Next.js

- Use functional components with hooks
- Follow React best practices
- Keep components small and focused
- Use proper TypeScript types

### Database/Prisma

- Follow existing schema patterns
- Create migrations for schema changes
- Use meaningful model and field names
- Add appropriate indexes

### Styling

- Use Tailwind CSS classes
- Follow existing component patterns
- Ensure responsive design
- Maintain dark/light theme support

### Code Quality Checks

Before submitting, ensure your code passes:

```bash
# Format code
pnpm format

# Lint check
pnpm lint

# Type check
pnpm type-check

# Build check
pnpm build
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Test additions or corrections
- `chore:` Maintenance tasks
- `ci:` CI/CD changes

### Examples
```bash
feat(auth): add OAuth provider for Discord
fix(workspace): resolve member invitation email bug
docs(readme): update installation instructions
chore(deps): update dependencies
```

## Pull Request Process

### Before Submitting

1. **Update from main:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run all checks:**
   ```bash
   pnpm format
   pnpm lint:fix
   pnpm build
   ```

3. **Test your changes thoroughly**

### PR Guidelines

- **Title:** Use conventional commit format
- **Description:**
  - Explain what changes you made
  - Why you made them
  - Link related issues
  - Include screenshots for UI changes
- **Size:** Keep PRs focused and reasonably sized
- **Tests:** Include tests for new functionality
- **Documentation:** Update relevant docs

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe your testing process

## Checklist
- [ ] My code follows the project style guidelines
- [ ] I have performed a self-review
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] I have updated documentation accordingly
```

## Reporting Issues

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Safari]
- Node version: [e.g., 18.x]
- Database: [e.g., PostgreSQL 14]
```

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem

**Describe the solution**
What you want to happen

**Describe alternatives**
Other solutions you've considered

**Additional context**
Any other context or screenshots
```

## Getting Help

- **Discord:** [Join our community](https://discord.gg/your-invite)
- **Discussions:** Use GitHub Discussions for questions
- **Issues:** For bug reports and feature requests

## Recognition

Contributors will be recognized in:
- The README.md contributors section
- Release notes
- Our website (if applicable)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make this project better! 🎉