# Project Structure

This document describes the folder structure and organization of the project.

## Root Directory

```
inventory-management-system/
├── .github/              # GitHub Actions workflows
├── backend/              # Node.js/Express API
├── docker/               # Docker configurations
├── docs/                 # Project documentation
├── frontend/             # React application
├── package.json          # Root package.json with workspaces
├── docker-compose.yml    # Development Docker Compose
├── docker-compose.prod.yml # Production Docker Compose
├── .gitignore           # Git ignore patterns
├── .editorconfig        # Editor configuration
├── .eslintrc.json       # ESLint configuration
├── .prettierrc          # Prettier configuration
└── .dockerignore        # Docker ignore patterns
```

## Backend Structure

```
backend/
├── src/
│   └── index.js         # Main entry point
├── config/
│   └── database.js      # Database configuration
├── controllers/
│   └── itemController.js # Controller layer
├── models/
│   └── Item.js          # Data models
├── routes/
│   └── itemRoutes.js    # API routes
├── services/
│   ├── itemService.js   # Business logic
│   └── exampleService.js
├── .env                 # Development environment variables
├── .env.prod           # Production environment variables
└── package.json
```

## Frontend Structure

```
frontend/
├── src/
│   ├── components/      # Reusable React components
│   │   └── Button.jsx
│   ├── pages/          # Page components
│   │   ├── Home.jsx
│   │   └── Dashboard.jsx
│   ├── hooks/          # Custom React hooks
│   │   └── useExample.js
│   ├── services/       # API services
│   │   └── api.js
│   ├── App.jsx         # Main App component
│   ├── main.jsx        # Entry point
│   └── App.css         # Global styles
├── .env                # Development environment variables
├── .env.prod          # Production environment variables
├── package.json
└── vite.config.js      # Vite configuration
```

## Docker Structure

```
docker/
├── Dockerfile.backend   # Backend container definition
├── Dockerfile.frontend # Frontend container definition
└── nginx.conf          # Nginx configuration for production
```

## Documentation Structure

```
docs/
├── project-structure.md
├── coding-standards.md
├── git-workflow.md
├── environment-setup.md
└── scaling-guidelines.md
```

## Key Principles

1. **Separation of Concerns**: Each folder has a specific purpose
2. **Modular Design**: Components, services, and routes are modular
3. **Configuration**: Environment-specific config in `.env` files
4. **Containerization**: All services run in Docker containers
