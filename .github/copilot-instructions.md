# 🤖 GitHub Copilot Instructions for DomDom Project

## 📋 Overview

This file provides comprehensive instructions for GitHub Copilot to follow when assisting with development on the DomDom operational system for food production and manufacturing businesses. These instructions consolidate guidelines from:

- `PLANNING.md` - Architecture and design patterns
- `Project Requirements Document.md` - Project objectives and requirements
- `PROJECT_OVERVIEW.md` - Implementation status and system components
- `RULES.md` - Development guidelines and best practices
- `TASKS.md` - Current tasks and priorities

## 🎯 Project Context

DomDom is an integrated operational management system for food production businesses that includes:

- Inventory/stock management with real-time tracking
- Bill of Materials (BOM) creation and management
- Production planning and tracking
- Sales recording and invoice generation
- Employee productivity and attendance tracking
- Custom document generation
- Business analytics and reporting

The system uses a modern architecture with a NestJS backend, PostgreSQL database, and React frontend.

## 🛠️ Current Refactoring Focus

The project is currently undergoing refactoring to ensure consistent code style and organization:

1. **Frontend Component Refactoring**:

   - Resolving component duplication across the project
   - Converting component filenames from PascalCase to kebab-case
   - Reorganizing file structure to group related components
   - Extracting business logic from UI components into custom hooks

2. **Backend Code Refactoring**:
   - Reviewing files over 500 lines and splitting into modules
   - Ensuring consistent module structure across features
   - Verifying proper separation of concerns (thin controllers, logic in services)

When assisting with these tasks, be mindful of:

- Maintaining functionality during refactoring
- Updating all imports when files are moved or renamed
- Preserving type definitions and documentation
- Testing that the application builds successfully after changes

## 💼 Coding Instructions

### General Guidelines

1. **Follow the Golden Rules**:

   - Keep files under 500 lines - split into modules when needed
   - Update TASKS.md file if there is any update needed
   - In tasks description be specific as much as possible
   - One task per message is ideal
   - Write documentation and comments as you go
   - Be specific in requests and provide examples
   - Test early and often
   - don't use any type unless it's necessary and if you used them add eslint ignore rule
   - To improve maintainability in modules, you can split large files into multiple smaller files, such as creating a services or utils folder with related functions. Then, import these functions where needed.

2. **Project Structure Awareness**:

   - Respect the existing folder organization
   - Backend uses NestJS module architecture
   - Frontend uses React component architecture with Ant Design
   - Follow established patterns in the codebase

3. **Code Modularity**:
   - Organize code into clearly separated modules grouped by feature
   - Use clear, consistent imports (prefer relative imports)
   - Check if types exist before creating new ones
   - Place types in `src/types` directory

### Frontend Development

1. **Component Guidelines**:

   - Use functional components with hooks
   - Follow kebab-case for component filenames (`production-order-list.tsx`)
   - Use PascalCase for component names (`ProductionOrderList`)
   - Separate business logic from UI using custom hooks
   - Group related components in feature folders

2. **State Management**:

   - Use React Query for server state
   - Use Context API for shared state
   - Use local state for component-specific state

3. **UI Standards**:
   - Follow Ant Design patterns consistently
   - Use i18n for all user-facing strings
   - Ensure responsive design for all components

### Backend Development

1. **Module Structure**:

   - Follow NestJS module architecture
   - Keep controllers thin, move business logic to services
   - Use DTOs for data validation
   - Follow camelCase for filenames
   - Every file should be error free
   - every Type should be in one place under \*/types/\*\*.ts folder so it will be easy to find them and look for the types

2. **API Design**:

   - Use RESTful principles
   - Document APIs with Swagger/OpenAPI
   - Follow established error handling patterns
   - Use appropriate HTTP status codes

3. **Database Interactions**:
   - Use TypeORM repositories for data access
   - Follow the established entity structure
   - Use transactions for operations that modify multiple entities

## 🚀 Implementation Priorities

Currently prioritize development in this order:

1. **Frontend and Backend Refactoring**:

   - Complete the detailed refactoring tasks outlined in TASKS.md
   - Ensure consistent code organization and naming conventions
   - Fix component duplication issues
   - Extract business logic into appropriate hooks

2. **Production Management** (currently in progress):

   - Focus on completing remaining production management features
   - Implement search and filtering for production orders
   - Add production statistics to dashboard
   - Create production reports view

3. **BOM Management Improvements**:

   - Enhance BOM component UI/UX
   - Implement material requirements and cost calculation views

4. **Upcoming Features** (after current priorities):
   - Sales Management frontend
   - Employee Management frontend
   - Document Generation frontend

## 🧪 Testing Requirements

1. Always create tests for new features
2. Update existing tests when modifying logic
3. Include tests for:
   - Expected behavior
   - Edge cases
   - Failure scenarios
4. Verify application builds and runs after refactoring changes

## 📚 Documentation Standards

1. Update README.md when features are added or dependencies change
2. Comment non-obvious code with explanations of why, not just what
3. Document API endpoints with JSDoc or Swagger
4. Mark completed tasks in TASKS.md with detailed notes on changes made

## ⚠️ Important Constraints

1. **Never assume missing context** - ask questions if uncertain
2. **Never hallucinate libraries or functions** - use only verified packages
3. **Always confirm file paths** before referencing them
4. **Check for existing types** before creating new ones
5. **Maintain consistency** with established patterns in the codebase
6. **Validate changes carefully** - ensure refactoring doesn't break functionality

## 📝 Code Style

Follow the established code style:

### TypeScript

- Use strict type checking
- any types are prohibited
- Prefer interfaces for object shapes
- Use enums for fixed sets of values
- Use camelCase for variables and functions

### React

- Follow functional component patterns
- Use React Query for API calls
- Follow established error handling
- Use the provided i18n setup for translations

### Naming Conventions

- **Components**: PascalCase
- **Functions**: camelCase
- **Variables**: camelCase
- **Types/Interfaces**: PascalCase
- **Files**:
  - Frontend: kebab-case
  - Backend: camelCase

## 🔄 Development Process

1. **Read task requirements** carefully before implementing
2. **Check existing implementations** for patterns to follow
3. **Design modular solutions** that maintain separation of concerns
4. **Test early and often** to catch issues
5. **Document your work** as you go
6. **Update TASKS.md** when work is completed, with specific details about what was done

## 📋 Refactoring Process Guidelines

When assisting with refactoring tasks:

1. **Component Duplication Resolution**:

   - Compare implementations to determine which is more complete/correct
   - Keep the version that best follows project patterns
   - Update all imports to reference the correct file
   - Verify functionality after consolidation

2. **File Naming Convention Updates**:

   - Generate a list of files that need renaming
   - Create a renaming script or plan for systematic updates
   - Update all import statements across the project
   - Test that application builds after renaming

3. **File Structure Reorganization**:

   - Move files to their appropriate feature folders
   - Ensure logical grouping of related components
   - Update all import paths after reorganization
   - Verify application functionality after reorganization

4. **Component Structure Enhancement**:

   - Extract business logic into custom hooks
   - Keep UI components focused on presentation
   - Ensure proper prop typing and validation
   - Add useful comments explaining complex logic

5. **Backend Refactoring**:
   - Split large files into smaller, focused modules
   - Ensure consistent pattern use across features
   - Verify controllers delegate business logic to services
   - Maintain proper error handling throughout

## 🗺️ Project Structure Map

The following is a high-level map of the DomDom project structure to help with navigation and context:

### Root Level

- LICENSE
- package.json, package-lock.json
- README.md, PLANNING.md, RULES.md, TASKS.md, PROJECT_OVERVIEW.md, Project Requirements Document.md
- .github/ (GitHub configs, Copilot instructions)

### backend/

- API.md, package.json, README.md, nest-cli.json, tsconfig\*.json
- data-source.ts (TypeORM config)
- src/
  - app.\* (NestJS entrypoint)
  - config/ (database and ORM configs)
  - database/ (data-source, seed, migrations)
  - entities/ (TypeORM entities: attendance, bom, document, employee, inventory, product, production-order, etc.)
  - types/ (centralized backend types)
  - auth/, bom/, documents/, employees/, inventory/, production/, products/, reminders/, repositories/, sales/, services/, users/ (feature modules: controllers, services, DTOs, types, etc.)
  - common/ (filters, shared logic)
  - interfaces/ (shared interfaces)
  - test/ (e2e tests)

### frontend/

- package.json, README.md, vite.config.ts, vitest.config.ts, tsconfig\*.json
- public/ (static assets, locales)
- scripts/ (build/dev scripts)
- src/
  - App.tsx, main.tsx, App.css, index.css, vite-env.d.ts
  - assets/ (images, etc.)
  - components/ (React components, grouped by feature)
  - context/ (React context providers)
  - hooks/ (custom React hooks)
  - i18n/ (internationalization setup)
  - pages/ (top-level pages)
  - services/ (API clients, business logic)
  - test/ (frontend test setup)
  - types/ (centralized frontend types)
  - utils/ (utility functions)

---

- Types are centralized in `src/types/` for both backend and frontend.
- Feature modules are grouped by domain (e.g., production, employees, sales).
- Documentation and planning files are at the root.
- .github/ contains Copilot instructions and project automation configs.

_This map will be updated as the project evolves. Use it for quick navigation and context when assisting with development tasks._

---

_Follow these instructions for all development work on the DomDom project._
