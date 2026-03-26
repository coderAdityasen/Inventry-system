# Coding Standards

This document outlines the coding standards and best practices for the project.

## General Principles

- **Clean Code**: Write readable, maintainable code
- **DRY (Don't Repeat Yourself)**: Extract common logic into reusable functions
- **SOLID Principles**: Follow object-oriented design principles
- **Consistency**: Follow established patterns throughout the codebase

## JavaScript/Node.js Standards

### Naming Conventions

- **Variables**: Use camelCase (`userName`, `itemList`)
- **Constants**: Use UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Functions**: Use camelCase, verb prefix (`getUser`, `createItem`)
- **Classes**: Use PascalCase (`UserService`, `ItemController`)
- **Files**: Use kebab-case (`user-service.js`, `item-controller.js`)

### Code Style

- Use `const` by default, `let` only when needed
- Use arrow functions for callbacks
- Use template literals for string concatenation
- Use destructuring for objects and arrays
- Use async/await over Promises

### Example

```javascript
// Good
const getUserById = async (id) => {
  const { userId, name, email } = await userService.findById(id);
  return { userId, name, email };
};

// Avoid
var getUserById = function(id) {
  return userService.findById(id).then(function(user) {
    return { userId: user.id, name: user.name, email: user.email };
  });
};
```

## React Standards

### Component Structure

```jsx
// Functional component with hooks
function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, []);
  
  const handleAction = () => {
    // Event handler
  };
  
  return (
    <div className="component-name">
      <h1>{prop1}</h1>
      <button onClick={handleAction}>Action</button>
    </div>
  );
}
```

### Hooks Rules

- Only call hooks at the top level (not inside loops, conditions)
- Only call hooks from React functions (not regular JS functions)
- Use custom hooks to extract and reuse stateful logic

### File Organization

```
components/
├── common/           # Reusable UI components
│   ├── Button.jsx
│   └── Input.jsx
├── layout/           # Layout components
│   └── Header.jsx
└── features/         # Feature-specific components
    └── items/
        └── ItemCard.jsx
```

## API Design Standards

### RESTful Endpoints

```
GET    /api/v1/items          # Get all items
GET    /api/v1/items/:id     # Get single item
POST   /api/v1/items          # Create item
PUT    /api/v1/items/:id     # Update item
DELETE /api/v1/items/:id     # Delete item
```

### Response Format

```javascript
// Success response
{
  "success": true,
  "data": { /* result */ },
  "message": "Operation successful"
}

// Error response
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Database Standards

- Use parameterized queries to prevent SQL injection
- Use connection pooling for performance
- Use migrations for schema changes
- Add indexes for frequently queried columns
- Use transactions for multi-step operations

## Git Commit Standards

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: code formatting
refactor: restructure code
test: add tests
chore: maintenance tasks
```

Example:
```
feat(items): add search functionality for inventory items

- Add search input component
- Implement search API endpoint
- Add search result display

Closes #123
```

## Testing Standards

- Write unit tests for business logic
- Write integration tests for API endpoints
- Write component tests for React components
- Aim for 80% code coverage
- Use descriptive test names

## Code Review Checklist

- [ ] Code follows naming conventions
- [ ] Code is properly formatted
- [ ] No console.log statements in production
- [ ] Error handling is implemented
- [ ] Security best practices followed
- [ ] Tests are included
- [ ] Documentation is updated
