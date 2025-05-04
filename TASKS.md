# 📋 DomDom Project Tasks

This document tracks current tasks, priorities, and progress for the DomDom project. Tasks are organized by module/feature to provide a comprehensive view of each business function's implementation status.

## 🔄 System-Wide Tasks

### Codebase Refactoring

- [x] Read rules and coding style and plan refactoring approach
- [ ] Component Refactoring:
  - [ ] Resolve component duplication across the system
  - [ ] Fix file naming conventions (PascalCase to kebab-case)
  - [ ] Reorganize file structure by feature modules
  - [ ] Extract business logic from UI components into custom hooks
- [ ] Code Quality Improvements:
  - [ ] Review and refactor files exceeding 500 lines
  - [ ] Ensure consistent module structure across features
  - [ ] Verify proper separation of concerns (thin controllers, business logic in services)

## 📦 Inventory Management Module

### Core Inventory Management - Status: ✅ COMPLETED

- ✅ Implement basic inventory management
  - ✅ Create inventory types and database models
  - ✅ Implement inventory API services
  - ✅ Create product management interface
  - ✅ Implement inventory transactions recording
  - ✅ Add basic stock level tracking

### Inventory Enhancements - Status: 🔄 IN PROGRESS

- [x] Implement advanced inventory management:
  - [x] Create intelligent low stock alert system based on historical daily usage
  - [x] Implement predictive stock forecasting based on production schedules
  - [x] Add batch tracking for raw materials
  - [x] Create inventory valuation reports
  - [x] Implement inventory count and reconciliation workflows
  - [x] Track inventory wastage and spoilage for food products
  
### Inventory Enhancement Testing & Integration - Status: 🔄 IN PROGRESS

- [ ] Complete backend and frontend integration:
  - [ ] Fix remaining linting errors related to entity updates
  - [ ] Complete database migrations for new entity properties (leadTimeDays, costPrice, productId)
  - [ ] Implement unit tests for inventory services
  - [ ] Integrate frontend components with backend API endpoints
  - [ ] Refine UI based on user feedback
  - [ ] Add comprehensive error handling and loading states

## 🏭 Production Management Module

### Core Production Management - Status: ✅ COMPLETED

- ✅ Implement production management system
  - ✅ Create production types and database models
  - ✅ Implement production order API services
  - ✅ Create production order management interface
  - ✅ Implement production recording functionality
  - ✅ Create production order details views

### Production Management Enhancements - Status: 🔄 IN PROGRESS

- [ ] Add advanced production management features
  - [ ] Implement search and filtering for production orders
  - [ ] Create production statistics and metrics dashboard
  - [ ] Implement production reports with export options
  - [ ] Add batch production tracking
  - [ ] Implement quality control checkpoints
  - [ ] Create notifications for completed production orders

## 📑 Bill of Materials (BOM) Module

### Core BOM Management - Status: ✅ COMPLETED

- ✅ Implement basic BOM functionality
  - ✅ Create BOM types and database models
  - ✅ Implement BOM API services
  - ✅ Create basic BOM management interface
  - ✅ Implement material requirements functionality

### BOM Enhancements - Status: 🔄 PLANNED

- [ ] Enhance BOM management system
  - [ ] Improve BOM component UI/UX
  - [ ] Add comprehensive material requirements calculation
  - [ ] Implement advanced cost calculation view
  - [ ] Support packaging (emballage) as a BOM item
  - [ ] Create BOM version control and history
  - [ ] Implement BOM comparison features
- [ ] Implement advanced product costing
  - [ ] Calculate material costs based on inventory valuation
  - [ ] Include packaging costs in product calculations
  - [ ] Create flexible employee cost allocation options
  - [ ] Track overhead and fixed cost allocation
  - [ ] Generate cost breakdown analytics

## 👨‍💼 Employee Management Module

### Core Employee Management - Status: ✅ COMPLETED

- ✅ Implement basic employee management
  - ✅ Create employee database models and types
  - ✅ Implement employee management API services
  - ✅ Create employee profiles and management interface
  - ✅ Implement basic attendance tracking
  - ✅ Create simple employee scheduling system

### Employee Management Enhancements - Status: 🔄 PLANNED

- [ ] Enhance employee management system
  - [ ] Add employee roles and skill sets
  - [ ] Track daily employee assignments to different products
  - [ ] Implement comprehensive scheduling system
  - [ ] Create employee performance metrics
- [ ] Implement salary and bonus management
  - [ ] Create base salary configuration for roles
  - [ ] Implement timesheet tracking and validation
  - [ ] Develop performance-based bonus calculation
  - [ ] Create payroll and performance reporting

## 💰 Sales Management Module

### Core Sales Management - Status: ✅ PARTIALLY COMPLETED

- ✅ Implement basic sales recording
  - ✅ Create sales database models and types
  - ✅ Implement sales API services
  - ✅ Create sales list and form components
  - ✅ Implement CRUD operations for sales
  - ✅ Add basic sales reporting endpoints

### Sales Management Enhancements - Status: 🔄 PLANNED

- [ ] Implement door-to-door sales workflow
  - [ ] Create mobile-friendly interface for door-to-door salespeople
  - [ ] Implement end-of-day sales reconciliation
  - [ ] Add offline mode for areas with poor connectivity
  - [ ] Create sales team dashboard with performance metrics
- [ ] Implement business client order management
  - [ ] Create specialized order form for business clients
  - [ ] Implement recurring order functionality
  - [ ] Add business customer management
  - [ ] Create business customer invoicing with payment tracking
- [ ] Implement invoice generation
  - [ ] Create invoice template system
  - [ ] Implement invoice generation UI and logic
  - [ ] Add invoice export options (PDF/Excel)

## 🛒 Purchase Management Module

### Purchase Management - Status: 🔄 PLANNED

- [ ] Implement purchase management system
  - [ ] Create purchase database models and types
  - [ ] Implement purchase API services
  - [ ] Create supplier management interface
  - [ ] Implement purchase order tracking
  - [ ] Add supplier information management
  - [ ] Create purchase reporting and analytics

## 📄 Document Generation Module

### Document Generation - Status: 🔄 PLANNED

- [ ] Implement document generation system
  - [ ] Create document template database models
  - [ ] Implement document generation API services
  - [ ] Create document template management interface
  - [ ] Implement document generation UI
  - [ ] Add document preview functionality
  - [ ] Create document export options (PDF/Excel)
  - [ ] Implement "bon de sortie" generation for delivery vans

## 💸 Financial Management Module

### Financial Management - Status: 🔄 PLANNED

- [ ] Implement expense tracking system
  - [ ] Create expense database models and types
  - [ ] Implement expense tracking API services
  - [ ] Create monthly bill tracking for fixed expenses
  - [ ] Track variable expenses (fuel, supplies)
  - [ ] Implement expense categorization and reporting
  - [ ] Create expense dashboard with period comparison
- [ ] Implement financial reporting system
  - [ ] Create period-based revenue tracking
  - [ ] Develop net profit calculation based on time periods
  - [ ] Generate profit margin analysis by product
  - [ ] Implement sales channel profitability comparison
  - [ ] Create financial performance dashboard
  - [ ] Add export options for all financial reports

## 🚐 Vehicle Management Module

### Vehicle Management - Status: 🔄 PLANNED

- [ ] Implement delivery van fleet management
  - [ ] Create vehicle database models and types
  - [ ] Implement vehicle management API services
  - [ ] Create vehicle profiles for the 2 delivery vans
  - [ ] Track mileage and fuel consumption
  - [ ] Schedule preventive maintenance based on mileage/time
  - [ ] Set up notifications for upcoming maintenance
  - [ ] Manage maintenance records and history
  - [ ] Track maintenance costs per vehicle

## 📊 Reporting & Analytics Module

### Core Reporting - Status: ✅ PARTIALLY COMPLETED

- ✅ Implement basic reporting
  - ✅ Create basic dashboard with key metrics
  - ✅ Implement simple inventory reports
  - ✅ Add basic sales reporting

### Reporting Enhancements - Status: 🔄 PLANNED

- [ ] Implement comprehensive reporting system
  - [ ] Create business intelligence dashboards
  - [ ] Implement cost trend analysis with visualizations
  - [ ] Generate product profitability comparison tools
  - [ ] Create cash flow forecasting based on orders and expenses
  - [ ] Implement report scheduling and automation

## 🐛 Bugs to Fix

- [ ] Correct error in production record counting
- [ ] Fix date formatting issues in production order details
- [ ] Address performance issues when loading large number of orders

## 📈 Future Enhancements

- [ ] Add drag-and-drop functionality to production scheduling
- [ ] Implement barcode scanning for inventory tracking
- [ ] Create mobile-responsive views for shop floor access
- [ ] Add real-time notifications for production events
