# DomDom - Operational System Overview

## Project Description

DomDom is an integrated operational management system for food production and manufacturing businesses. It manages inventory/stock, bills of materials (BOM), sales, employee production tracking, attendance, invoicing, and custom document generation. The system helps streamline operations and automate manual processes.

## Technology Stack

### Backend

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT-based authentication
- **API Documentation**: Swagger/OpenAPI

### Frontend

- **Framework**: React
- **Language**: TypeScript
- **UI Library**: Ant Design (antd)
- **State Management**: React Query (TanStack Query)
- **Internationalization**: i18next
- **HTTP Client**: Axios

## Core Modules and Features

### Authentication & User Management

- Role-based access control
- User registration and authentication
- JWT-based sessions

### Inventory Management (Refactored)

- Simplified stock management system:
  - Unified tracking of raw materials and finished products
  - Stock movement tracking (production in/out, sales, purchases)
  - Stock adjustment functionality for inventory reconciliation
- Manual inventory count workflow with discrepancy resolution
- Product pricing mechanism and comprehensive stock valuation
- Real-time metrics dashboard displaying:
  - Lowest stock items with automatic alerts
  - Total stock value calculation
  - Most profitable items based on margin analysis
  - Top-sold items by quantity
- Analytics features:
  - Stock level trend visualization
  - Detailed view for each metric with historical data
  - Performance optimized data retrieval with caching

### BOM (Bill of Materials) Management

- Recipe/formula creation and management
- Raw material requirements calculation
- Production costs calculation (including packaging/emballage)
- BOM versioning
- Optional employee cost allocation in product costing

### Production Management

- Production order creation and tracking
- Raw material consumption
- Output recording
- Production progress tracking
- Employee productivity metrics
- Production efficiency reporting

### Sales Management

- Direct sales recording
- Commercial agent (door-to-door) sales tracking with end-of-day reconciliation for salespeople
- Company/business order management and tracking
- Inventory updates tied to sales
- Sales analysis and reporting
- Customer relationship management

### Employee Management

- Attendance tracking (clock in/out)
- Production output tracking by employee
- Daily task assignment to different products
- Employee performance metrics and KPIs
- Productivity reporting and analysis
- Salary management system
- Performance-based bonus calculation
- Employee cost allocation for product costing (optional)

### Document Generation

- Invoice generation
- "Bon de Sortie" (delivery note) generation
- Custom report generation
- PDF/Excel export options

### Dashboard & Reporting

- Real-time operational metrics
- Inventory status
- Production efficiency
- Sales overview
- Employee productivity
- Net profit calculation and reporting (period-based)

### Reminders & Maintenance Tracking

- Bill payment reminders (electricity, rent, loans, gas, etc.)
- Equipment and vehicle/van maintenance scheduling
- Notification system

### Purchase Management

- Purchase order tracking (achats) from suppliers (fournisseurs)
- Supplier management
- Purchase analytics and reporting

### Employee Salary & Bonus Management

- Salary management
- Bonus calculation based on performance
- Salary and bonus reporting

## Project Structure

### Backend Structure

- **auth/**: Authentication and authorization
- **bom/**: Bill of Materials management
- **documents/**: Document generation and management
- **employees/**: Employee and attendance management
- **entities/**: Database entity definitions
- **inventory/**: Inventory and stock management
- **production/**: Production orders and records management
- **sales/**: Sales transactions and invoices
- **reminders/**: Reminders and notifications
- **users/**: User management
- **common/**: Shared utilities and helpers

### Frontend Structure

- **src/components/**: Reusable React components
- **src/pages/**: Page components for each route
- **src/services/**: API communication services
- **src/context/**: React context providers
- **src/hooks/**: Custom React hooks
- **src/types/**: TypeScript type definitions
- **src/utils/**: Utility functions
- **src/i18n/**: Internationalization configuration

## Main Features Implementation Status

### Backend Implementation

The backend has most of the core functionality implemented:

- ✅ User authentication and authorization
- ✅ Inventory tracking and management
- ✅ BOM creation and management
- ✅ Production order management
- ✅ Production output recording
- ✅ Sales recording (direct and commercial)
- ✅ Employee attendance tracking
- ✅ Document generation (invoices, delivery notes)
- ✅ API endpoints for operational data

### Frontend Implementation

The frontend currently has partial implementation of features:

- ✅ User authentication
- ✅ Basic navigation and layout
- ✅ Dashboard with preliminary widgets
- ✅ Inventory management (basic view)
- ✅ Production page (recently implemented with order management)
- ⚠️ BOM management (partial implementation)
- ❌ Sales management (not implemented)
- ⚠️ Employee management (partial implementation)
- ❌ Document generation UI (not implemented)
- ❌ Reminders system (not implemented)

### Employee Management (Frontend)

- EmployeeManagement component created in src/components/employee/employee-management.tsx
- Page added at src/pages/employee-management.tsx
- i18n keys added for employee fields
- Attendance tracking UI implemented (tabbed view, attendance table)
- Productivity metrics view implemented (tabbed view, productivity table)
- Scheduling features implemented (tabbed view, scheduling table)

All features use React Query, Ant Design, and i18n. Types and service functions are modular and located in src/types and src/services.

### Implementation Priority

Current development priorities for frontend implementation:

1. Production management (in progress)
2. Complete BOM management
3. Sales recording and management
4. Employee tracking and productivity
5. Document generation interfaces
6. Reminders and maintenance tracking

## Deployment and Environment

The application can be deployed as:

1. A web application accessible via browser
2. An Electron desktop application for Windows (optional)

## Getting Started

### Backend Setup

1. Install dependencies: `cd backend && npm install`
2. Configure database connection in `backend/src/config/database.config.ts`
3. Run database migrations: `npm run migration:run`
4. Start the development server: `npm run start:dev`

### Frontend Setup

1. Install dependencies: `cd frontend && npm install`
2. Configure API URL in `.env` or `frontend/src/services/api.ts`
3. Start the development server: `npm run dev`

## API Documentation

API documentation is available at `/api/docs` when the backend server is running.

## 🏭 Production Management Module

**Status:** ✅ COMPLETED

- Core production management system implemented
- Advanced features added:
  - Advanced search and filtering (by employee, BOM, date, status)
  - Batch production tracking
  - Quality control checkpoints (backend & frontend)
  - Notifications for completed production orders
  - Production statistics and metrics dashboard
  - Production reports with export to PDF/Excel
  - Improved documentation and API docs
  - e2e and unit tests for all features

## Inventory to Stock Module Refactoring

The current inventory management system is being refactored into a more streamlined "Stock" module to better align with the business workflow of food production companies. This refactoring aims to:

1. **Simplify the Data Model**: Focus on stock as the central entity used to create products, with products going back into stock.

2. **Enhance Financial Metrics**: Add key metrics tracking for stock value, most profitable items, top-selling items, and low stock alerts.

3. **Streamline Stock Management Workflows**: Simplify stock-in and stock-out processes, inventory counts, and reconciliation.

4. **Improve Analytics**: Provide better visibility into stock performance, valuation, and movement patterns.

The refactored Stock module will retain essential functionality like stock management and periodic inventory checks while removing unnecessary complexity. The backend services and frontend components will be updated to reflect this new structure and naming convention.

### Key Components of the Stock Module:

- **Stock Management**: Tracking of raw materials and finished products
- **Stock Transactions**: Recording stock movements (purchases, production inputs/outputs, sales)
- **Stock Valuation**: Financial tracking of total stock value
- **Stock Analytics**: Identifying most profitable items and top sellers
- **Stock Counts**: Simplified periodic inventory verification process
- **Low Stock Monitoring**: Alerts for items that need replenishment
