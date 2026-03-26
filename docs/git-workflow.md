# Git Workflow

This document outlines the Git workflow and branching strategy for the project.

## Branch Strategy

### Main Branches

- `main` - Production-ready code, tagged releases
- `develop` - Integration branch for features

### Supporting Branches

- `feature/*` - New features (e.g., `feature/add-user-auth`)
- `fix/*` - Bug fixes (e.g., `fix/login-validation`)
- `hotfix/*` - Critical production fixes (e.g., `hotfix/security-patch`)
- `refactor/*` - Code refactoring (e.g., `refactor/database-layer`)
- `docs/*` - Documentation updates

## Workflow

### 1. Starting a New Feature

```bash
# Update your local develop branch
git checkout develop
git pull origin develop

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### 2. Working on a Feature

```bash
# Make changes and commit them
git add .
git commit -m "feat: description of changes"

# Push to remote
git push origin feature/your-feature-name
```

### 3. Submitting a Pull Request

1. Ensure your feature branch is up to date with `develop`
2. Create a Pull Request on GitHub
3. Fill out the PR template with:
   - Description of changes
   - Related issues
   - Testing performed
4. Request code review
5. Address feedback and make changes

### 4. Merging a Feature

1. After approval, merge into `develop`
2. Delete the feature branch locally and remotely

```bash
git checkout develop
git pull origin develop
git merge feature/your-feature-name
git push origin develop
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## Commit Conventions

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Testing
- `chore` - Maintenance

### Examples

```bash
# Feature
git commit -m "feat(items): add search functionality"

# Bug fix
git commit -m "fix(auth): resolve token expiration issue"

# Documentation
git commit -m "docs(api): update endpoints documentation"
```

## Pre-commit Hooks

The project uses Husky with lint-staged for pre-commit validation:

- ESLint checks for code quality
- Prettier formats code automatically

To bypass hooks (use sparingly):

```bash
git commit --no-verify -m "feat: urgent change"
```

## Code Review Guidelines

### For Reviewers

- Review within 24 hours
- Be constructive and specific
- Suggest improvements, don't just criticize
- Approve if changes are acceptable

### For Authors

- Keep PRs small and focused
- Include clear description
- Add screenshots for UI changes
- Respond to feedback promptly

## Release Process

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- `MAJOR` - Breaking changes
- `MINOR` - New features (backward compatible)
- `PATCH` - Bug fixes

### Release Steps

```bash
# Update version
npm version 1.0.0

# Create release tag
git tag -a v1.0.0 -m "Release v1.0.0"

# Push tags
git push origin --tags
```

## Common Git Commands

```bash
# Check status
git status

# View history
git log --oneline -10

# Stash changes
git stash

# Apply stashed changes
git stash pop

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Find specific commit
git log --all --grep="search term"
```
