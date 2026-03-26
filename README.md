# Inventory Management System

A production-grade, scalable full-stack web application for inventory management built with React, Node.js, Express, and MySQL.

## Overview

This project provides a solid foundation for building inventory management applications. It follows best practices for code quality, scalability, and developer experience.

**Context**: A full-stack web application that allows businesses to track products, manage stock levels, and monitor supply chain activity in real time. Supports CRUD operations for items, categories, and suppliers, along with low-stock alerts, search/filter capabilities, and dashboard analytics. Features JWT-based authentication and role-based access control.

> **Note**: This is a template/boilerplate project. Core business logic is not implemented - only the foundation, standards, and structure are in place for developers to build upon.

## Features

- **Modern Stack**: React 19 + Vite, Node.js/Express, MySQL 8
- **Production Ready**: Docker containerization, Nginx serving
- **Code Quality**: ESLint, Prettier, EditorConfig
- **Git Hooks**: Pre-commit validation with Husky
- **API Ready**: RESTful architecture with placeholder endpoints
- **Type Safety**: JSDoc comments for type inference

## Project Structure

```
inventory-management-system/
├── .github/              # GitHub Actions workflows
├── backend/              # Node.js/Express API
│   ├── src/             # Application source
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   └── services/        # Business logic
├── docker/              # Docker configurations
├── docs/                # Project documentation
├── frontend/            # React application
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom hooks
│   │   └── services/   # API services
│   └── package.json
├── docker-compose.yml   # Development setup
└── docker-compose.prod.yml # Production setup
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MySQL 8 (optional, can use Docker)

### Development with Docker

```bash
# Clone repository
git clone <repository-url>
cd inventory-management-system

# Start development environment
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MySQL: localhost:3306

### Manual Setup

#### Backend

```bash
cd backend
npm install
cp .env.example .env  # Configure environment
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env  # Configure environment
npm run dev
```

## Scripts

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services with Docker |
| `npm run dev:build` | Build and start with Docker |

### Production

| Command | Description |
|---------|-------------|
| `npm run prod` | Start production with Docker |
| `npm run prod:build` | Build production images |

### Code Quality

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## API Endpoints

Placeholder endpoints are available:

```
GET    /health              # Health check
GET    /api/v1/items        # Get all items (placeholder)
```

## Technology Stack

### Frontend
- React 19
- Vite 8
- React Router DOM 6
- Axios

### Backend
- Node.js
- Express.js
- MySQL 2
- Helmet
- Morgan
- CORS

### Infrastructure
- Docker
- Nginx
- MySQL 8

## Environment Variables

### Backend

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=inventory_db
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

### Frontend

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Inventory Management System
VITE_ENVIRONMENT=development
```

## Documentation

- [Project Structure](./docs/project-structure.md)
- [Coding Standards](./docs/coding-standards.md)
- [Git Workflow](./docs/git-workflow.md)
- [Environment Setup](./docs/environment-setup.md)
- [Scaling Guidelines](./docs/scaling-guidelines.md)

## Contributing

1. Create a feature branch from `develop`
2. Follow the [coding standards](./docs/coding-standards.md)
3. Write tests for new features
4. Submit a pull request for review

### Branch Naming

```
feature/<description>
fix/<description>
hotfix/<description>
refactor/<description>
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: code formatting
refactor: restructure code
test: add tests
```

## License

ISC

## Support

For issues and questions, please open a GitHub issue.
