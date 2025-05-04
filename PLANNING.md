# 🏗️ DomDom Project Planning

This document outlines the architecture, design patterns, and development roadmap for the DomDom operational system.

## 🎯 Project Goals

DomDom aims to provide an integrated management system for food production businesses, including:

1. Streamline inventory management with real-time tracking and low stock alerts
2. Simplify production planning and BOM management with accurate cost calculation
3. Automate sales recording (both door-to-door and direct orders) and invoice generation
4. Track employee productivity, attendance, salaries, and performance-based bonuses
5. Generate custom documents for operations (invoices, bon de sortie)
6. Track vehicle maintenance and provide timely reminders
7. Monitor monthly expenses (electricity, loans, fuel) and calculate net profit
8. Provide analytics and reporting for business insights
9. Support both web and optional desktop deployment

## 📐 Architecture

### System Architecture

The DomDom system uses a modern client-server architecture:

```
┌───────────────┐                  ┌───────────────┐
│  Frontend     │                  │  Backend      │
│  React + Vite │ ◄────REST API────┤  NestJS       │
└───────────────┘                  └───────┬───────┘
                                          │
                                          ▼
                                   ┌───────────────┐
                                   │  Database     │
                                   │  PostgreSQL   │
                                   └───────────────┘
```

### Backend Architecture

NestJS follows a modular architecture with controllers, services, and modules:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Controller   │ ──► │   Service     │ ──► │  Repository   │
│  (API Routes) │     │  (Logic)      │     │  (Data)       │
└───────────────┘     └───────────────┘     └───────────────┘
```

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Handle data persistence
- **DTOs**: Define data transfer objects for validation
- **Entities**: Define database models

### Frontend Architecture

React application with component-based architecture and Ant Design for UI:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│    Pages      │ ──► │  Components   │ ──► │    Hooks      │
│  (Routes)     │     │  (UI)         │     │  (Logic)      │
└───────────────┘     └───────────────┘     └───────────────┘
                                                   │
                                                   ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Services    │ ◄── │    Context    │ ◄── │     State     │
│  (API)        │     │  (Global)     │     │  (Local)      │
└───────────────┘     └───────────────┘     └───────────────┘
```

- **Pages**: Main route components
- **Components**: Reusable UI elements
- **Hooks**: Custom business logic
- **Services**: API communication
- **Context**: Global state management
- **Types**: TypeScript type definitions

## 🎨 Design Patterns & Conventions

### Naming Conventions

- **Files**:
  - Frontend: kebab-case for components (`production-order-list.tsx`)
  - Backend: camelCase for files (`productionOrder.service.ts`)
- **Components**: PascalCase (`ProductionOrderList`)
- **Functions**: camelCase (`getProductionOrders`)
- **Variables**: camelCase (`productionOrder`)
- **Types/Interfaces**: PascalCase (`ProductionOrder`)
- **Enums**: PascalCase with values in UPPER_SNAKE_CASE or PascalCase

### Code Organization

#### Frontend

```
src/
├── components/
│   ├── common/           # Shared components
│   ├── layout/           # Layout components
│   └── [feature]/        # Feature-specific components
├── pages/                # Route components
├── services/             # API services
│   ├── api.ts            # Base API configuration
│   └── [feature]Services/ # Feature-specific API
├── hooks/                # Custom hooks
├── context/              # React context providers
├── types/                # TypeScript definitions
├── utils/                # Utility functions
└── i18n/                 # Internationalization
```

#### Backend

```
src/
├── modules/              # Feature modules
│   └── [feature]/
│       ├── controllers/  # API endpoints
│       ├── services/     # Business logic
│       ├── dto/          # Data transfer objects
│       └── entities/     # Database models
├── common/               # Shared resources
│   ├── filters/          # Exception filters
│   ├── guards/           # Authentication guards
│   ├── decorators/       # Custom decorators
│   └── interceptors/     # Request interceptors
└── config/               # Configuration
```

## 📝 Coding Standards

### TypeScript Best Practices

1. Use strict type checking
2. Avoid `any` types
3. Prefer interfaces for object shapes
4. Use enums for fixed sets of values
5. Use type guards for runtime type checking

### React Best Practices

1. Use functional components with hooks
2. Separate UI from business logic
3. Use React Query for server state
4. Use context for shared state
5. Memoize expensive calculations and callbacks

### NestJS Best Practices

1. Follow modular structure
2. Use dependency injection
3. Validate inputs with DTO classes
4. Use guards for authorization
5. Handle exceptions with filters

## 📚 Technology Stack Details

### Frontend

- **Framework**: React 18+
- **Build Tool**: Vite
- **State Management**: React Query + Context API
- **UI Library**: Ant Design
- **Form Handling**: Ant Design Form + custom hooks
- **Internationalization**: i18next
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library

### Backend

- **Framework**: NestJS
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Logging**: Winston

## 🗺️ Development Roadmap

### Phase 1: Foundation (Completed)

- Initial project setup
- Authentication system
- Core database models
- Base API structure

### Phase 2: Core Features (In Progress)

- ✅ Inventory management
- ✅ BOM management
- ✅ Basic dashboard
- ✅ Production management backend
- ✅ Production management frontend (recently implemented)

### Phase 3: Advanced Features (Upcoming)

- Sales management (including direct orders and door-to-door sales tracking)
- Employee tracking (with salary management and performance-based bonuses)
- Vehicle maintenance tracking and scheduling
- Financial tracking (monthly bills, expenses, profit calculation)
- Document generation (invoices, bon de sortie)
- Advanced reporting

### Phase 4: Enhancements

- Reminders & notifications
- Desktop application (Electron)
- Advanced analytics
- Mobile responsiveness

## 🛠️ Development Approach

1. **Feature-driven development**:

   - Develop complete features (backend + frontend)
   - Focus on delivering business value

2. **Iterative implementation**:

   - Implement MVP functionality first
   - Refine and enhance based on feedback

3. **Testing strategy**:

   - Write unit tests for critical logic
   - Perform integration testing for key workflows

4. **Documentation**:
   - Document APIs with Swagger
   - Maintain up-to-date README and planning documents
