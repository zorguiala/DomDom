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

### Inventory Management

- Real-time tracking of stock levels
- Raw materials, work-in-process, and finished goods tracking
- Inventory transactions history
- Stock adjustments and transfers
- Low stock alerts
- Barcode scanning support

### BOM (Bill of Materials) Management

- Recipe/formula creation and management
- Raw material requirements calculation
- Production costs calculation
- BOM versioning

### Production Management

- Production order creation and tracking
- Raw material consumption
- Output recording
- Production progress tracking
- Employee productivity metrics
- Production efficiency reporting

### Sales Management

- Direct sales recording
- Commercial agent sales tracking
- Inventory updates tied to sales
- Sales analysis and reporting

### Employee Management

- Attendance tracking
- Production output tracking
- Employee performance metrics
- Productivity reporting

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

### Reminders & Maintenance Tracking

- Bill payment reminders
- Equipment maintenance scheduling
- Notification system

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
- ❌ Employee management (not implemented)
- ❌ Document generation UI (not implemented)
- ❌ Reminders system (not implemented)

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
